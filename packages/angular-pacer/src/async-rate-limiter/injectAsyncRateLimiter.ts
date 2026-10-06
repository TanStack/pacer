import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { shallow } from '@tanstack/angular-store'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'

export interface AngularAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the rate limiter instance.
   * When provided, replaces the default cleanup (abort).
   */
  onUnmount?: (rateLimiter: AngularAsyncRateLimiter<TFn, TSelected>) => void
}

export interface AngularAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<
  AsyncRateLimiter<TFn>,
  | 'maybeExecute'
  | 'getRemainingInWindow'
  | 'getMsUntilNextWindow'
  | 'getAbortSignal'
  | 'abort'
  | 'reset'
> {
  readonly key: Signal<AsyncRateLimiter<TFn>['key']>
  readonly fn: Signal<AsyncRateLimiter<TFn>['fn']>
  readonly options: Signal<
    AsyncRateLimiter<TFn>['options'] &
      AngularAsyncRateLimiterOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<AsyncRateLimiter<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  readonly asyncRetryers: Signal<AsyncRateLimiter<TFn>['asyncRetryers']>
}

/**
 * An Angular function that creates and manages an AsyncRateLimiter instance.
 *
 * This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async rate limiting functionality with promise support, error handling,
 * retry capabilities, and abort support.
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
 * By default, the function aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this.
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const rateLimiter = injectAsyncRateLimiter(
 *   async (id: string) => {
 *     const response = await fetch(`/api/data/${id}`);
 *     return response.json();
 *   },
 *   { limit: 5, window: 60000, windowType: 'sliding' }
 * );
 *
 * // In an event handler
 * const handleRequest = async (id: string) => {
 *   const result = await rateLimiter.maybeExecute(id);
 *   console.log('Result:', result);
 * };
 * ```
 */
export function injectAsyncRateLimiter<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncRateLimiterOptions<TFn, TSelected>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected,
): AngularAsyncRateLimiter<TFn, TSelected>
export function injectAsyncRateLimiter<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularAsyncRateLimiterOptions<TFn, {}>>,
  selector?: undefined,
): AngularAsyncRateLimiter<TFn, {}>
export function injectAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncRateLimiterOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
): AngularAsyncRateLimiter<TFn, TSelected | {}>
export function injectAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularPacerOptions<
    AngularAsyncRateLimiterOptions<TFn, TSelected | {}>
  >,
  selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
): AngularAsyncRateLimiter<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal<
    AngularAsyncRateLimiterOptions<TFn, TSelected | {}>
  >(() => ({
    ...defaults.asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  }))
  // A callback can outlive a superseded operation promise or an abort/reset.
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new AsyncRateLimiter<TFn>(
          ((...args: Parameters<TFn>) => pending.run(() => fn(...args))) as TFn,
          initialOptions,
        )
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: AsyncRateLimiter<TFn>) => {
    const onUnmount = {
      ...current.options,
      ...resolvedOptions(),
    }.onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.abort()
    }
  }

  function run(): void
  function run<T>(operation: (current: AsyncRateLimiter<TFn>) => T): T
  function run<T>(
    operation?: (current: AsyncRateLimiter<TFn>) => T,
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
          pending.set(current.asyncRetryers.size > 0)
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
  const state = computed(() => (selector ? selector(snapshot()) : {}), {
    equal: shallow,
  })
  effect(() => {
    snapshot()
    pending.set(instance().asyncRetryers.size > 0)
  })

  const result: AngularAsyncRateLimiter<TFn, TSelected | {}> = {
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
    getRemainingInWindow: (...args) =>
      run((current) => current.getRemainingInWindow(...args)),
    getMsUntilNextWindow: (...args) =>
      run((current) => current.getMsUntilNextWindow(...args)),
    getAbortSignal: (...args) =>
      run((current) => current.getAbortSignal(...args)),
    abort: (...args) => run((current) => current.abort(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
