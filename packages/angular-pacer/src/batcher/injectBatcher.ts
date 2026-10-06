import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { Batcher } from '@tanstack/pacer/batcher'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

export interface AngularBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the batcher instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (batcher: AngularBatcher<TValue, TSelected>) => void
}

export interface AngularBatcher<TValue, TSelected = {}> extends Pick<
  Batcher<TValue>,
  'addItem' | 'flush' | 'peekAllItems' | 'clear' | 'cancel' | 'reset'
> {
  readonly key: Signal<Batcher<TValue>['key']>
  readonly fn: Signal<Batcher<TValue>['fn']>
  readonly options: Signal<
    Batcher<TValue>['options'] & AngularBatcherOptions<TValue, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<Batcher<TValue>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularBatcherOptions<TValue, TSelected>>,
  ) => void
}

/**
 * An Angular function that creates and manages a Batcher instance.
 *
 * This is a lower-level function that provides direct access to the Batcher's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The Batcher collects items and processes them in batches based on configurable conditions:
 * - Maximum batch size
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for state management and wraps it with Angular signals.
 * The `selector` parameter allows you to specify which state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary updates when irrelevant state changes occur.
 *
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
 *
 * ## Cleanup on Destroy
 *
 * By default, the function cancels any pending batch when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const batcher = injectBatcher(fn, {
 *   maxSize: 5,
 *   onUnmount: (b) => b.flush()
 * });
 * ```
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const batcher = injectBatcher(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 }
 * );
 *
 * // Add items
 * batcher.addItem('task1');
 *
 * // Access the selected state
 * const { items, isPending } = batcher.state();
 * ```
 */
export function injectBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => void,
  options: AngularPacerOptions<AngularBatcherOptions<TValue, TSelected>>,
  selector: (state: BatcherState<TValue>) => TSelected,
): AngularBatcher<TValue, TSelected>
export function injectBatcher<TValue>(
  fn: (items: Array<TValue>) => void,
  options?: AngularPacerOptions<AngularBatcherOptions<TValue, {}>>,
  selector?: undefined,
): AngularBatcher<TValue, {}>
export function injectBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options?: AngularPacerOptions<AngularBatcherOptions<TValue, TSelected | {}>>,
  selector?: (state: BatcherState<TValue>) => TSelected,
): AngularBatcher<TValue, TSelected | {}>
export function injectBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options?: AngularPacerOptions<AngularBatcherOptions<TValue, TSelected | {}>>,
  selector?: (state: BatcherState<TValue>) => TSelected,
): AngularBatcher<TValue, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.batcher,
    ...(typeof options === 'function' ? options() : options),
  }))
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new Batcher<TValue>(fn, initialOptions)
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: Batcher<TValue>) => {
    const onUnmount = (
      current.options as AngularBatcherOptions<TValue, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
    }
  }

  function run(): void
  function run<T>(operation: (current: Batcher<TValue>) => T): T
  function run<T>(operation?: (current: Batcher<TValue>) => T): T | undefined {
    return outsideZone(() =>
      untracked(() => {
        const latest = resolvedOptions()
        const current = instance()
        if (!effectOwnsInstance && !unregisterEarlyCleanup) {
          unregisterEarlyCleanup = owner.onDestroy(() =>
            outsideZone(() => untracked(() => cleanup(current))),
          )
        }
        current.setOptions(latest)
        try {
          return operation?.(current)
        } finally {
          pending.set(current.store.state.isPending)
        }
      }),
    )
  }

  // Read only identity here: option changes must not dispose the stable instance.
  effect((onCleanup) => {
    const current = instance()
    effectOwnsInstance = true
    unregisterEarlyCleanup?.()
    unregisterEarlyCleanup = undefined
    onCleanup(() => outsideZone(() => untracked(() => cleanup(current))))
  })

  effect(() => {
    const current = instance()
    const latest = resolvedOptions()
    outsideZone(() =>
      untracked(() => {
        current.setOptions(latest)
      }),
    )
  })

  const snapshot = injectExternalStore(() => {
    const current = instance()
    return {
      getSnapshot: () => current.store.state,
      subscribe: (notify) => {
        const { unsubscribe } = current.store.subscribe(notify)
        return unsubscribe
      },
    }
  })

  const state = computed(() => (selector ? selector(snapshot()) : {}))
  effect(() => pending.set(snapshot().isPending))

  const result: AngularBatcher<TValue, TSelected | {}> = {
    key: computed(() => instance().key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().options, ...latest }
    }),
    store: computed(() => instance().store),
    state,
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    addItem: (...args) => run((current) => current.addItem(...args)),
    flush: (...args) => run((current) => current.flush(...args)),
    peekAllItems: (...args) => run((current) => current.peekAllItems(...args)),
    clear: (...args) => run((current) => current.clear(...args)),
    cancel: (...args) => run((current) => current.cancel(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
