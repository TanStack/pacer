import { computed, effect, untracked } from '@angular/core'
import { Batcher } from '@tanstack/pacer/batcher'
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
import type { BatcherOptions, BatcherState } from '@tanstack/pacer'
import type { MethodMap } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectBatcher}, including core configuration and Angular cleanup.
 */
export interface AngularBatcherOptions<TValue> extends BatcherOptions<TValue> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending batches).
   */
  onUnmount?: (core: Batcher<TValue>) => void
}

const batcherMethodMap = {
  fn: false,
  setOptions: false,
  addItem: true,
  flush: true,
  peekAllItems: true,
  clear: true,
  cancel: true,
  reset: true,
} satisfies MethodMap<Batcher<unknown>>

const batcherMethods = methodNames(batcherMethodMap)

type BatcherMethod = (typeof batcherMethods)[number]

/**
 * An Angular Batcher ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularBatcher<TValue, TSelected = {}> extends Pick<
  Batcher<TValue>,
  BatcherMethod
> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular Batcher in the current injection context.
 *
 * Collects items and processes a batch when its size or delay threshold is reached.
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
 * The default cleanup is to cancel pending batches. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectBatcher(
 *   (items: Array<string>) => console.log(items),
 *   () => ({ maxSize: 10, wait: 100 }),
 *   (state) => state.isPending,
 * )
 * utility.addItem('job')
 * console.log(utility.state())
 * ```
 */
export function injectBatcher<TValue>(
  fn: (items: Array<TValue>) => void,
  options?: MaybeAccessor<AngularBatcherOptions<TValue>>,
): AngularBatcher<TValue>
/**
 * Creates an Angular Batcher with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => void,
  options: MaybeAccessor<AngularBatcherOptions<TValue>>,
  selector: (state: BatcherState<TValue>) => TSelected,
): AngularBatcher<TValue, TSelected>
export function injectBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => void,
  options: MaybeAccessor<AngularBatcherOptions<TValue>> = {},
  selector: (state: BatcherState<TValue>) => TSelected | {} = () => ({}),
): AngularBatcher<TValue, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed(() => ({
    ...baseOptions.batcher,
    ...optionsSignal(),
  }))

  const batcherSignal = injectLazy(
    () => new Batcher<TValue>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    batcherSignal,
    batcherMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => batcherSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = batcherSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => batcherSignal().store,
    (state) => state.isPending,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => batcherSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
