import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface AngularAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the batcher instance.
   * When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (batcher: AngularAsyncBatcher<TValue, TSelected>) => void
}

export interface AngularAsyncBatcher<TValue, TSelected = {}> extends Pick<
  AsyncBatcher<TValue>,
  | 'addItem'
  | 'flush'
  | 'peekAllItems'
  | 'peekFailedItems'
  | 'clear'
  | 'getAbortSignal'
  | 'abort'
  | 'cancel'
  | 'reset'
> {
  readonly key: Signal<AsyncBatcher<TValue>['key']>
  readonly fn: Signal<AsyncBatcher<TValue>['fn']>
  readonly options: Signal<
    AsyncBatcher<TValue>['options'] &
      AngularAsyncBatcherOptions<TValue, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<AsyncBatcher<TValue>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  readonly asyncRetryers: Signal<AsyncBatcher<TValue>['asyncRetryers']>
}

/**
 * An Angular function that creates and manages an AsyncBatcher instance.
 *
 * This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The AsyncBatcher collects items and processes them in batches asynchronously with support for
 * promise-based processing, error handling, retry capabilities, and abort support.
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
 * By default, the function cancels any pending batch and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const batcher = injectAsyncBatcher(fn, {
 *   maxSize: 10,
 *   onUnmount: (b) => b.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const batcher = injectAsyncBatcher(
 *   async (items: Array<Data>) => {
 *     const response = await fetch('/api/batch', {
 *       method: 'POST',
 *       body: JSON.stringify(items)
 *     });
 *     return response.json();
 *   },
 *   { maxSize: 10, wait: 2000 }
 * );
 *
 * // Add items
 * batcher.addItem(data1);
 * batcher.addItem(data2);
 *
 * // Access the selected state
 * const { items, isExecuting } = batcher.state();
 * ```
 */
export function injectAsyncBatcher<TValue, TSelected>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AngularPacerOptions<AngularAsyncBatcherOptions<TValue, TSelected>>,
  selector: (state: AsyncBatcherState<TValue>) => TSelected,
): AngularAsyncBatcher<TValue, TSelected>
export function injectAsyncBatcher<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options?: AngularPacerOptions<AngularAsyncBatcherOptions<TValue, {}>>,
  selector?: undefined,
): AngularAsyncBatcher<TValue, {}>
export function injectAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options?: AngularPacerOptions<
    AngularAsyncBatcherOptions<TValue, TSelected | {}>
  >,
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): AngularAsyncBatcher<TValue, TSelected | {}>
export function injectAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options?: AngularPacerOptions<
    AngularAsyncBatcherOptions<TValue, TSelected | {}>
  >,
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): AngularAsyncBatcher<TValue, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.asyncBatcher,
    ...(typeof options === 'function' ? options() : options),
  }))
  // A callback can outlive a superseded operation promise or an abort/reset.
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new AsyncBatcher<TValue>(
          (items) => pending.run(() => fn(items)),
          initialOptions,
        )
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: AsyncBatcher<TValue>) => {
    const onUnmount = (
      current.options as AngularAsyncBatcherOptions<TValue, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
      current.abort()
    }
  }

  function run(): void
  function run<T>(operation: (current: AsyncBatcher<TValue>) => T): T
  function run<T>(
    operation?: (current: AsyncBatcher<TValue>) => T,
  ): T | undefined {
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
          pending.set(
            current.store.state.isPending || current.asyncRetryers.size > 0,
          )
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

  // The retryer map also covers automatic retry waits; displayed flags may reset.
  const state = computed(() => (selector ? selector(snapshot()) : {}))
  effect(() =>
    pending.set(snapshot().isPending || instance().asyncRetryers.size > 0),
  )

  const result: AngularAsyncBatcher<TValue, TSelected | {}> = {
    key: computed(() => instance().key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().options, ...latest }
    }),
    store: computed(() => instance().store),
    state,
    asyncRetryers: computed(
      () => {
        snapshot()
        return instance().asyncRetryers
      },
      { equal: () => false },
    ),
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    addItem: (...args) =>
      run((current) => pending.run(() => current.addItem(...args))),
    flush: (...args) =>
      run((current) => pending.run(() => current.flush(...args))),
    peekAllItems: (...args) => run((current) => current.peekAllItems(...args)),
    peekFailedItems: (...args) =>
      run((current) => current.peekFailedItems(...args)),
    clear: (...args) => run((current) => current.clear(...args)),
    getAbortSignal: (...args) =>
      run((current) => current.getAbortSignal(...args)),
    abort: (...args) => run((current) => current.abort(...args)),
    cancel: (...args) => run((current) => current.cancel(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
