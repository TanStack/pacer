import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'

export interface AngularAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the debouncer instance.
   * When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (debouncer: AngularAsyncDebouncer<TFn, TSelected>) => void
}

export interface AngularAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<
  AsyncDebouncer<TFn>,
  'maybeExecute' | 'flush' | 'getAbortSignal' | 'abort' | 'cancel' | 'reset'
> {
  readonly key: Signal<AsyncDebouncer<TFn>['key']>
  readonly fn: Signal<AsyncDebouncer<TFn>['fn']>
  readonly options: Signal<
    AsyncDebouncer<TFn>['options'] &
      AngularAsyncDebouncerOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<AsyncDebouncer<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  readonly asyncRetryers: Signal<AsyncDebouncer<TFn>['asyncRetryers']>
}

/**
 * An Angular function that creates and manages an AsyncDebouncer instance.
 *
 * This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async debouncing functionality with promise support, error handling,
 * retry capabilities, and abort support.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
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
 * Available state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the debounced function is currently executing asynchronously
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastResult`: The result from the most recent successful function execution
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
 * - `successCount`: Number of function executions that have completed successfully
 *
 * ## Cleanup on Destroy
 *
 * By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const debouncer = injectAsyncDebouncer(fn, {
 *   wait: 500,
 *   onUnmount: (d) => d.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const debouncer = injectAsyncDebouncer(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`);
 *     return response.json();
 *   },
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isExecuting changes (optimized for loading states)
 * const debouncer = injectAsyncDebouncer(
 *   async (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
 * );
 *
 * // In an event handler
 * const handleChange = async (e: Event) => {
 *   const target = e.target as HTMLInputElement;
 *   const result = await debouncer.maybeExecute(target.value);
 *   console.log('Search results:', result);
 * };
 *
 * // Access the selected state
 * const { isExecuting, errorCount } = debouncer.state();
 * ```
 */
export function injectAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncDebouncerOptions<TFn, TSelected>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected,
): AngularAsyncDebouncer<TFn, TSelected>
export function injectAsyncDebouncer<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncDebouncerOptions<TFn, {}>>,
  selector?: undefined,
): AngularAsyncDebouncer<TFn, {}>
export function injectAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncDebouncerOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
): AngularAsyncDebouncer<TFn, TSelected | {}>
export function injectAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncDebouncerOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
): AngularAsyncDebouncer<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.asyncDebouncer,
    ...(typeof options === 'function' ? options() : options),
  }))
  // A callback can outlive a superseded operation promise or an abort/reset.
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new AsyncDebouncer<TFn>(
          ((...args: Parameters<TFn>) => pending.run(() => fn(...args))) as TFn,
          initialOptions,
        )
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: AsyncDebouncer<TFn>) => {
    const onUnmount = (
      current.options as AngularAsyncDebouncerOptions<TFn, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
      current.abort()
    }
  }

  function run(): void
  function run<T>(operation: (current: AsyncDebouncer<TFn>) => T): T
  function run<T>(
    operation?: (current: AsyncDebouncer<TFn>) => T,
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

  const result: AngularAsyncDebouncer<TFn, TSelected | {}> = {
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
    maybeExecute: (...args) =>
      run((current) => pending.run(() => current.maybeExecute(...args))),
    flush: (...args) =>
      run((current) => pending.run(() => current.flush(...args))),
    getAbortSignal: (...args) =>
      run((current) => current.getAbortSignal(...args)),
    abort: (...args) => run((current) => current.abort(...args)),
    cancel: (...args) => run((current) => current.cancel(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
