import { useMemo, useState } from 'react'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { useStore } from '@tanstack/react-store'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'

export interface ReactRateLimiter<
  TFn extends AnyFunction,
  TSelected = RateLimiterState,
> extends Omit<RateLimiter<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Readonly<TSelected>
}

/**
 * A low-level React hook that creates a `RateLimiter` instance to enforce rate limits on function execution.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
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
 * **By default, all state changes will trigger a re-render.** To optimize performance, you can
 * provide a selector function that returns only the specific state values your component needs.
 * The component will only re-render when the selected values change.
 *
 * Available state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 *
 * The hook returns an object containing:
 * - maybeExecute: The rate-limited function that respects the configured limits
 * - getExecutionCount: Returns the number of successful executions
 * - getRejectionCount: Returns the number of rejected executions due to rate limiting
 * - getRemainingInWindow: Returns how many more executions are allowed in the current window
 * - reset: Resets the execution counts and window timing
 *
 * @example
 * ```tsx
 * // Basic rate limiting - max 5 calls per minute with a sliding window (re-renders on any state change)
 * const rateLimiter = useRateLimiter(apiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 * });
 *
 * // Only re-render when execution count changes (optimized for tracking successful executions)
 * const rateLimiter = useRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Only re-render when rejection count changes (optimized for tracking rate limit violations)
 * const rateLimiter = useRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({ rejectionCount: state.rejectionCount })
 * );
 *
 * // Only re-render when execution times change (optimized for window calculations)
 * const rateLimiter = useRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({ executionTimes: state.executionTimes })
 * );
 *
 * // Multiple state properties - re-render when any of these change
 * const rateLimiter = useRateLimiter(
 *   apiCall,
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     rejectionCount: state.rejectionCount
 *   })
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
 * // Access the selected state
 * const { executionCount, rejectionCount } = rateLimiter.state;
 * ```
 */
export function useRateLimiter<
  TFn extends AnyFunction,
  TSelected = RateLimiterState,
>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
  selector?: (state: RateLimiterState) => TSelected,
): ReactRateLimiter<TFn, TSelected> {
  const [rateLimiter] = useState(() => new RateLimiter<TFn>(fn, options))

  const state = useStore(rateLimiter.store, selector)

  rateLimiter.setOptions(options)

  return useMemo(
    () =>
      ({
        ...rateLimiter,
        state,
      }) as ReactRateLimiter<TFn, TSelected>, // omit `store` in favor of `state`
    [rateLimiter, state],
  )
}
