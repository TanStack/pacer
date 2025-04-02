import { useRef } from 'react'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

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
 * For smoother execution patterns:
 * - Use throttling when you want consistent spacing between executions (e.g. UI updates)
 * - Use debouncing when you want to collapse rapid-fire events (e.g. search input)
 * - Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)
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
 * // Basic rate limiting - max 5 calls per minute
 * const { maybeExecute } = useRateLimiter(apiCall, {
 *   maxExecutions: 5,
 *   windowMs: 60000
 * });
 *
 * // With Redux
 * const dispatch = useDispatch();
 * const { maybeExecute, getRemainingInWindow } = useRateLimiter(
 *   (value) => dispatch(updateAction(value)),
 *   { maxExecutions: 10, windowMs: 30000 }
 * );
 *
 * // Monitor rate limit status
 * const handleClick = () => {
 *   const remaining = getRemainingInWindow();
 *   if (remaining > 0) {
 *     maybeExecute(data);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 * ```
 */
export function useRateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  const rateLimiter = useRef<RateLimiter<TFn, TArgs>>(null)

  if (!rateLimiter.current) {
    rateLimiter.current = new RateLimiter(fn, options)
  }

  const setOptions = rateLimiter.current.setOptions.bind(rateLimiter.current)
  setOptions(options)

  return {
    maybeExecute: rateLimiter.current.maybeExecute.bind(rateLimiter.current),
    getExecutionCount: rateLimiter.current.getExecutionCount.bind(
      rateLimiter.current,
    ),
    getRejectionCount: rateLimiter.current.getRejectionCount.bind(
      rateLimiter.current,
    ),
    getRemainingInWindow: rateLimiter.current.getRemainingInWindow.bind(
      rateLimiter.current,
    ),
    reset: rateLimiter.current.reset.bind(rateLimiter.current),
    setOptions,
  } as const
}
