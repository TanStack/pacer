import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

export interface SolidRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'store'> {
  /**
   * Reactive state that will be updated when the rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<RateLimiterState>>
}

/**
 * A low-level Solid hook that creates a `RateLimiter` instance to enforce rate limits on function execution.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (createSignal, etc).
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
 * The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
 * to specify which state changes will trigger a re-render, optimizing performance by preventing
 * unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
 *
 * Available state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `rejectionCount`: Number of function calls that were rejected due to rate limiting
 * - `remainingInWindow`: Number of executions remaining in the current window
 * - `nextWindowTime`: Timestamp when the next window begins
 * - `currentWindowStart`: Timestamp when the current window started
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const rateLimiter = createRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 *   onReject: (rateLimiter) => {
 *     console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // Opt-in to re-render when rate limit state changes (optimized for UI feedback)
 * const rateLimiter = createRateLimiter(
 *   apiCall,
 *   { limit: 5, window: 60000 },
 *   (state) => ({
 *     remainingInWindow: state.remainingInWindow,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Opt-in to re-render when execution metrics change (optimized for tracking progress)
 * const rateLimiter = createRateLimiter(
 *   apiCall,
 *   { limit: 5, window: 60000 },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     nextWindowTime: state.nextWindowTime
 *   })
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { remainingInWindow, rejectionCount } = rateLimiter.state();
 * ```
 */
export function createRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
  selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
): SolidRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().rateLimiter,
    ...options,
  } as RateLimiterOptions<TFn>

  const rateLimiter = new RateLimiter<TFn>(fn, mergedOptions)

  const state = useStore(rateLimiter.store, selector)

  return {
    ...rateLimiter,
    state,
  } as SolidRateLimiter<TFn, TSelected> // omit `store` in favor of `state`
}
