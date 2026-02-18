import { DestroyRef, inject } from '@angular/core'
import { injectStore } from '@tanstack/angular-store'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

export interface AngularRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the rate limiter instance.
   */
  onUnmount?: (rateLimiter: AngularRateLimiter<TFn, TSelected>) => void
}

export interface AngularRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<RateLimiterState>>
}

/**
 * An Angular function that creates and manages a RateLimiter instance.
 *
 * This is a lower-level function that provides direct access to the RateLimiter's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * Rate limiting is a simple "hard limit" approach that allows executions until a maximum count is reached within
 * a time window, then blocks all subsequent calls until the window resets. Unlike throttling or debouncing,
 * it does not attempt to space out or collapse executions intelligently.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * For smoother execution patterns:
 * - Use throttling when you want consistent spacing between executions (e.g. UI updates)
 * - Use debouncing when you want to collapse rapid-fire events (e.g. search input)
 * - Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)
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
 * Available state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 *
 * ## Cleanup on Destroy
 *
 * Use the `onUnmount` option to run a callback when the component is destroyed.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const rateLimiter = injectRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 * });
 *
 * // Opt-in to track execution count changes
 * const rateLimiter = injectRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Monitor rate limit status
 * const handleClick = () => {
 *   const remaining = rateLimiter.getRemainingInWindow();
 *   if (remaining > 0) {
 *     rateLimiter.maybeExecute(data);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { executionCount, rejectionCount } = rateLimiter.state();
 * ```
 */
export function injectRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularRateLimiterOptions<TFn, TSelected>,
  selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
): AngularRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().rateLimiter,
    ...options,
  } as AngularRateLimiterOptions<TFn, TSelected>

  const rateLimiter = new RateLimiter<TFn>(fn, mergedOptions)
  const state = injectStore(rateLimiter.store, selector)

  const result = {
    ...rateLimiter,
    state,
  } as AngularRateLimiter<TFn, TSelected>

  const destroyRef = inject(DestroyRef, { optional: true })
  destroyRef?.onDestroy(() => {
    if (mergedOptions.onUnmount) {
      mergedOptions.onUnmount(result)
    }
  })

  return result
}
