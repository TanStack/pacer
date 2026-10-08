import { computed, effect, untracked } from '@angular/core'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type { AsyncQueuerOptions, AsyncQueuerState } from '@tanstack/pacer'
import type { MethodMap } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectAsyncQueuer}, including core configuration and Angular cleanup.
 */
export interface AngularAsyncQueuerOptions<
  TValue,
> extends AsyncQueuerOptions<TValue> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (stop automatic processing and abort running work).
   */
  onUnmount?: (core: AsyncQueuer<TValue>) => void
}

const asyncQueuerMethodMap = {
  fn: false,
  setOptions: false,
  addItem: true,
  getNextItem: true,
  execute: true,
  flush: true,
  flushAsBatch: true,
  peekNextItem: true,
  peekAllItems: true,
  peekActiveItems: true,
  peekPendingItems: true,
  start: true,
  stop: true,
  clear: true,
  abort: true,
  reset: true,
  getAbortSignal: true,
} satisfies MethodMap<AsyncQueuer<unknown>>

const asyncQueuerMethods = methodNames(asyncQueuerMethodMap)

type AsyncQueuerMethod = (typeof asyncQueuerMethods)[number]

/**
 * An Angular AsyncQueuer ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularAsyncQueuer<TValue, TSelected = {}> extends Pick<
  AsyncQueuer<TValue>,
  AsyncQueuerMethod
> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular AsyncQueuer in the current injection context.
 *
 * Processes queued items asynchronously with configurable pacing and concurrency.
 *
 * ## Options and state
 *
 * Accepts static options or an options factory. Factories are read lazily, and signal
 * dependencies update the existing core instance. Local options override provider defaults.
 * Methods apply current options before executing and run outside Angular's zone.
 *
 * Pass a selector to expose reactive core state through `state()`. Without a selector,
 * `state()` returns `{}`; operations remain available on the ref.
 *
 * ## Cleanup
 *
 * The default cleanup is to stop automatic processing and abort running work. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectAsyncQueuer(
 *   (item: string) => Promise.resolve(item),
 *   () => ({ wait: 100, concurrency: 2 }),
 *   (state) => state.items,
 * )
 * utility.addItem('job')
 * console.log(utility.state())
 * ```
 */
export function injectAsyncQueuer<TValue>(
  fn: (item: TValue) => Promise<any>,
  options?: MaybeAccessor<AngularAsyncQueuerOptions<TValue>>,
): AngularAsyncQueuer<TValue>
/**
 * Creates an Angular AsyncQueuer with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectAsyncQueuer<TValue, TSelected>(
  fn: (item: TValue) => Promise<any>,
  options: MaybeAccessor<AngularAsyncQueuerOptions<TValue>>,
  selector: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuer<TValue, TSelected>
export function injectAsyncQueuer<TValue, TSelected>(
  fn: (item: TValue) => Promise<any>,
  options: MaybeAccessor<AngularAsyncQueuerOptions<TValue>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected | {} = () => ({}),
): AngularAsyncQueuer<TValue, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed(() => ({
    ...baseOptions.asyncQueuer,
    ...optionsSignal(),
  }))

  const asyncQueuerSignal = injectLazy(
    () => new AsyncQueuer<TValue>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    asyncQueuerSignal,
    asyncQueuerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => asyncQueuerSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = asyncQueuerSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.stop()
        core.abort()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => asyncQueuerSignal().store,
    (state) => state.isExecuting || (state.isRunning && state.pendingTick),
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => asyncQueuerSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
