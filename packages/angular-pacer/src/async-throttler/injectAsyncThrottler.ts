import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

export interface AngularAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncThrottlerOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the throttler instance.
   * When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (throttler: AngularAsyncThrottler<TFn, TSelected>) => void
}

export interface AngularAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<
  AsyncThrottler<TFn>,
  'maybeExecute' | 'flush' | 'getAbortSignal' | 'abort' | 'cancel' | 'reset'
> {
  readonly key: Signal<AsyncThrottler<TFn>['key']>
  readonly fn: Signal<AsyncThrottler<TFn>['fn']>
  readonly options: Signal<
    AsyncThrottler<TFn>['options'] &
      AngularAsyncThrottlerOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<AsyncThrottler<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  readonly asyncRetryers: Signal<AsyncThrottler<TFn>['asyncRetryers']>
}

/**
 * An Angular function that creates and manages an AsyncThrottler instance.
 *
 * This is a lower-level function that provides direct access to the AsyncThrottler's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async throttling functionality with promise support, error handling,
 * retry capabilities, and abort support.
 *
 * The throttler will execute the function at most once within the specified wait time.
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
 * By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const throttler = injectAsyncThrottler(fn, {
 *   wait: 1000,
 *   onUnmount: (t) => t.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const throttler = injectAsyncThrottler(
 *   async (data: Data) => {
 *     const response = await fetch('/api/update', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   },
 *   { wait: 1000 }
 * );
 *
 * // In an event handler
 * const handleUpdate = async (data: Data) => {
 *   const result = await throttler.maybeExecute(data);
 *   console.log('Update result:', result);
 * };
 * ```
 */
export function injectAsyncThrottler<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncThrottlerOptions<TFn, TSelected>>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected,
): AngularAsyncThrottler<TFn, TSelected>
export function injectAsyncThrottler<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncThrottlerOptions<TFn, {}>>,
  selector?: undefined,
): AngularAsyncThrottler<TFn, {}>
export function injectAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncThrottlerOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
): AngularAsyncThrottler<TFn, TSelected | {}>
export function injectAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncThrottlerOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
): AngularAsyncThrottler<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.asyncThrottler,
    ...(typeof options === 'function' ? options() : options),
  }))
  // A callback can outlive a superseded operation promise or an abort/reset.
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new AsyncThrottler<TFn>(
          ((...args: Parameters<TFn>) => pending.run(() => fn(...args))) as TFn,
          initialOptions,
        )
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: AsyncThrottler<TFn>) => {
    const onUnmount = (
      current.options as AngularAsyncThrottlerOptions<TFn, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
      current.abort()
    }
  }

  function run(): void
  function run<T>(operation: (current: AsyncThrottler<TFn>) => T): T
  function run<T>(
    operation?: (current: AsyncThrottler<TFn>) => T,
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

  const result: AngularAsyncThrottler<TFn, TSelected | {}> = {
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
