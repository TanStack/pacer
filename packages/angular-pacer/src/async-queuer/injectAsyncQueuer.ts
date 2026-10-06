import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface AngularAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the queuer instance.
   * When provided, replaces the default cleanup (stop + abort); use it to call flush(), stop(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (queuer: AngularAsyncQueuer<TValue, TSelected>) => void
}

export interface AngularAsyncQueuer<TValue, TSelected = {}> extends Pick<
  AsyncQueuer<TValue>,
  | 'addItem'
  | 'getNextItem'
  | 'execute'
  | 'flush'
  | 'flushAsBatch'
  | 'peekNextItem'
  | 'peekAllItems'
  | 'peekActiveItems'
  | 'peekPendingItems'
  | 'start'
  | 'stop'
  | 'clear'
  | 'getAbortSignal'
  | 'abort'
  | 'reset'
> {
  readonly key: Signal<AsyncQueuer<TValue>['key']>
  readonly fn: Signal<AsyncQueuer<TValue>['fn']>
  readonly options: Signal<
    AsyncQueuer<TValue>['options'] &
      AngularAsyncQueuerOptions<TValue, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<AsyncQueuer<TValue>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  readonly asyncRetryers: Signal<AsyncQueuer<TValue>['asyncRetryers']>
}

/**
 * An Angular function that creates and manages an AsyncQueuer instance.
 *
 * This is a lower-level function that provides direct access to the AsyncQueuer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The AsyncQueuer processes items asynchronously with support for concurrent execution,
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
 * By default, the function stops the queuer and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending items instead:
 *
 * ```ts
 * const queuer = injectAsyncQueuer(fn, {
 *   concurrency: 2,
 *   onUnmount: (q) => q.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const queuer = injectAsyncQueuer(
 *   async (item: Data) => {
 *     const response = await fetch('/api/process', {
 *       method: 'POST',
 *       body: JSON.stringify(item)
 *     });
 *     return response.json();
 *   },
 *   { concurrency: 2, wait: 1000 }
 * );
 *
 * // Add items
 * queuer.addItem(data1);
 * queuer.addItem(data2);
 *
 * // Access the selected state
 * const { items, isExecuting } = queuer.state();
 * ```
 */
export function injectAsyncQueuer<TValue, TSelected>(
  fn: (value: TValue) => Promise<any>,
  options: AngularPacerOptions<AngularAsyncQueuerOptions<TValue, TSelected>>,
  selector: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuer<TValue, TSelected>
export function injectAsyncQueuer<TValue>(
  fn: (value: TValue) => Promise<any>,
  options?: AngularPacerOptions<AngularAsyncQueuerOptions<TValue, {}>>,
  selector?: undefined,
): AngularAsyncQueuer<TValue, {}>
export function injectAsyncQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => Promise<any>,
  options?: AngularPacerOptions<
    AngularAsyncQueuerOptions<TValue, TSelected | {}>
  >,
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuer<TValue, TSelected | {}>
export function injectAsyncQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => Promise<any>,
  options?: AngularPacerOptions<
    AngularAsyncQueuerOptions<TValue, TSelected | {}>
  >,
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuer<TValue, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.asyncQueuer,
    ...(typeof options === 'function' ? options() : options),
  }))
  // A callback can outlive a superseded operation promise or an abort/reset.
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        const value = new AsyncQueuer<TValue>(
          (item) => pending.run(() => fn(item)),
          {
            ...initialOptions,
            // Defer callbacks and processing to the owned startup boundary.
            initialItems: [],
            initialState: {
              ...initialOptions.initialState,
              isRunning: false,
              pendingTick: false,
            },
          },
        )
        // Expose the actual configuration, rather than inert-construction settings.
        value.options.initialItems = initialOptions.initialItems ?? []
        value.options.initialState = initialOptions.initialState
        return { value, initialOptions }
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  let initialized = false
  const cleanup = (current: AsyncQueuer<TValue>) => {
    const onUnmount = (
      current.options as AngularAsyncQueuerOptions<TValue, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.stop()
      current.abort()
    }
  }

  function run(): void
  function run<T>(operation: (current: AsyncQueuer<TValue>) => T): T
  function run<T>(
    operation?: (current: AsyncQueuer<TValue>) => T,
  ): T | undefined {
    return outsideZone(() =>
      untracked(() => {
        const latest = resolvedOptions()
        const current = instance().value
        current.setOptions(latest)
        if (!effectOwnsInstance && !unregisterEarlyCleanup) {
          unregisterEarlyCleanup = owner.onDestroy(() =>
            outsideZone(() => untracked(() => cleanup(current))),
          )
        }
        try {
          if (!initialized) {
            initialized = true
            const initialOptions = instance().initialOptions
            if (
              instance().initialOptions.initialState?.isRunning ??
              instance().initialOptions.started ??
              true
            )
              current.start()
            if (!initialOptions.initialState?.items) {
              const items = initialOptions.initialItems ?? []
              for (let index = 0; index < items.length; index++) {
                current.addItem(
                  items[index],
                  initialOptions.addItemsTo ?? 'back',
                  index === items.length - 1,
                )
              }
            }
          }
          return operation?.(current)
        } finally {
          pending.set(
            (current.store.state.isRunning &&
              current.store.state.items.length > 0) ||
              current.asyncRetryers.size > 0,
          )
        }
      }),
    )
  }

  // Read only identity here: option changes must not dispose the stable instance.
  effect((onCleanup) => {
    const current = instance().value
    effectOwnsInstance = true
    unregisterEarlyCleanup?.()
    unregisterEarlyCleanup = undefined
    onCleanup(() => outsideZone(() => untracked(() => cleanup(current))))
    run()
  })

  effect(() => {
    const current = instance().value
    const latest = resolvedOptions()
    outsideZone(() =>
      untracked(() => {
        current.setOptions(latest)
      }),
    )
  })

  const snapshot = injectExternalStore(() => {
    const current = instance().value
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
    pending.set(
      (snapshot().isRunning && snapshot().items.length > 0) ||
        instance().value.asyncRetryers.size > 0,
    ),
  )

  const result: AngularAsyncQueuer<TValue, TSelected | {}> = {
    key: computed(() => instance().value.key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().value.options, ...latest }
    }),
    store: computed(() => instance().value.store),
    state,
    asyncRetryers: computed(
      () => {
        snapshot()
        return instance().value.asyncRetryers
      },
      { equal: () => false },
    ),
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    addItem: (...args) => run((current) => current.addItem(...args)),
    getNextItem: (...args) => run((current) => current.getNextItem(...args)),
    execute: (...args) =>
      run((current) => pending.run(() => current.execute(...args))),
    flush: (...args) =>
      run((current) => pending.run(() => current.flush(...args))),
    flushAsBatch: (...args) =>
      run((current) => pending.run(() => current.flushAsBatch(...args))),
    peekNextItem: (...args) => run((current) => current.peekNextItem(...args)),
    peekAllItems: (...args) => run((current) => current.peekAllItems(...args)),
    peekActiveItems: (...args) =>
      run((current) => current.peekActiveItems(...args)),
    peekPendingItems: (...args) =>
      run((current) => current.peekPendingItems(...args)),
    start: (...args) => run((current) => current.start(...args)),
    stop: (...args) => run((current) => current.stop(...args)),
    clear: (...args) => run((current) => current.clear(...args)),
    getAbortSignal: (...args) =>
      run((current) => current.getAbortSignal(...args)),
    abort: (...args) => run((current) => current.abort(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
