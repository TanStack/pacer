import { DestroyRef, inject } from '@angular/core'
import { injectStore } from '@tanstack/angular-store'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
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
> extends Omit<AsyncRateLimiter<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the async rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>
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
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * ## Cleanup on Destroy
 *
 * By default, the function aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
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
export function injectAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularAsyncRateLimiterOptions<TFn, TSelected>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().asyncRateLimiter,
    ...options,
  } as AngularAsyncRateLimiterOptions<TFn, TSelected>

  const rateLimiter = new AsyncRateLimiter<TFn>(fn, mergedOptions)
  const state = injectStore(rateLimiter.store, selector)

  const result = {
    ...rateLimiter,
    state,
  } as AngularAsyncRateLimiter<TFn, TSelected>

  const destroyRef = inject(DestroyRef, { optional: true })
  destroyRef?.onDestroy(() => {
    if (mergedOptions.onUnmount) {
      mergedOptions.onUnmount(result)
    } else {
      rateLimiter.abort()
    }
  })

  return result
}
