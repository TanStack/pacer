import {
  assertInInjectionContext,
  computed,
  effect,
  untracked,
} from '@angular/core'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectInsideZone } from '../utils/zoneCompatibility'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { MethodMap } from '../utils/injectForwardMethods'
import type { ReadonlySelected } from '../utils/internalTypes'
import type { Signal } from '@angular/core'
import type { AsyncBatcherOptions, AsyncBatcherState } from '@tanstack/pacer'

/**
 * Options for {@link injectAsyncBatcher}, including core configuration and Angular cleanup.
 */
export interface AngularAsyncBatcherOptions<
  TValue,
> extends AsyncBatcherOptions<TValue> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending batches and abort running work).
   */
  onUnmount?: (batcher: AsyncBatcher<TValue>) => void
}

const asyncBatcherMethodMap = {
  fn: false,
  setOptions: false,
  addItem: true,
  flush: true,
  clear: true,
  abort: true,
  cancel: true,
  reset: true,
  getAbortSignal: true,
  peekAllItems: true,
  peekFailedItems: true,
} satisfies MethodMap<AsyncBatcher<unknown>>

const asyncBatcherMethods = methodNames(asyncBatcherMethodMap)

type AsyncBatcherMethod = (typeof asyncBatcherMethods)[number]

/**
 * An Angular AsyncBatcher ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularAsyncBatcher<TValue, TSelected = {}> extends Pick<
  AsyncBatcher<TValue>,
  AsyncBatcherMethod
> {
  /**
   * Reactive state that will be updated when the batcher state changes
   */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular AsyncBatcher in the current injection context.
 *
 * Collects items and processes each batch asynchronously when its size or delay threshold is reached.
 *
 * ## Options and state
 *
 * Accepts static options or an options factory. Factories are read lazily, and signal
 * dependencies update the existing core instance. Local options override provider defaults.
 * Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.
 *
 * Pass a selector to expose reactive core state through `state()`. Without a selector,
 * `state()` returns `{}`; operations remain available on the ref.
 *
 * ## Cleanup
 *
 * The default cleanup is to cancel pending batches and abort running work. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectAsyncBatcher(
 *   (items: Array<string>) => Promise.resolve(items),
 *   () => ({ maxSize: 10, wait: 100 }),
 *   (state) => state.isPending,
 * )
 * utility.addItem('job')
 * console.log(utility.state())
 * ```
 */
export function injectAsyncBatcher<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options?: MaybeAccessor<AngularAsyncBatcherOptions<TValue>>,
): AngularAsyncBatcher<TValue>
/**
 * Creates an Angular AsyncBatcher with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectAsyncBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: MaybeAccessor<AngularAsyncBatcherOptions<TValue>>,
  selector: (state: AsyncBatcherState<TValue>) => TSelected,
): AngularAsyncBatcher<TValue, TSelected>
export function injectAsyncBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: MaybeAccessor<AngularAsyncBatcherOptions<TValue>> = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected | {} = () => ({}),
): AngularAsyncBatcher<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectAsyncBatcher)
  }

  const runFn = injectInsideZone(fn)
  const baseOptions = injectPacerOptions()

  const optionsSignal = toAccessorSignal(options)

  const mergedOptions = computed(() => ({
    ...baseOptions.asyncBatcher,
    ...optionsSignal(),
  }))

  const getAsyncBatcher = injectLazy(
    () => new AsyncBatcher<TValue>(runFn, mergedOptions()),
    (core) => {
      const opts = mergedOptions()
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
        core.abort()
      }
    },
  )

  const methods = injectForwardMethods(
    getAsyncBatcher,
    asyncBatcherMethods,
    (asyncBatcher) => {
      asyncBatcher.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => getAsyncBatcher().setOptions(opts))
  })

  const hasPendingTasks = injectSelector(
    () => getAsyncBatcher().store,
    (state) => state.isPending || state.isExecuting,
  )

  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => getAsyncBatcher().store, selector, {
    compare: shallow,
  })

  return {
    state,
    ...methods,
  }
}
