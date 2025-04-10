import { useEffect } from 'react'
import { useRateLimitedState } from './useRateLimitedState'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

/**
 * A high-level React hook that creates a rate-limited version of a value that updates at most a certain number of times within a time window.
 * This hook uses React's useState internally to manage the rate-limited state.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
 * subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
 * or intelligently collapse updates. This can lead to bursts of rapid updates followed by periods of no updates.
 *
 * For smoother update patterns, consider:
 * - useThrottledValue: When you want consistent spacing between updates (e.g. UI changes)
 * - useDebouncedValue: When you want to collapse rapid updates into a single update (e.g. search input)
 *
 * Rate limiting should primarily be used when you need to enforce strict limits, like API rate limits.
 *
 * The hook returns both the rate-limited value and the underlying rateLimiter instance for additional control.
 *
 * For more direct control over rate limiting behavior without React state management,
 * consider using the lower-level useRateLimiter hook instead.
 *
 * @example
 * ```tsx
 * // Basic rate limiting - update at most 5 times per minute
 * const [rateLimitedValue] = useRateLimitedValue(rawValue, {
 *   limit: 5,
 *   window: 60000
 * });
 *
 * // With rejection callback
 * const [rateLimitedValue, rateLimiter] = useRateLimitedValue(rawValue, {
 *   limit: 3,
 *   window: 5000,
 *   onReject: ({ msUntilNextWindow }) => {
 *     console.log(`Update rejected. Try again in ${msUntilNextWindow}ms`);
 *   }
 * });
 *
 * // Optionally access rateLimiter methods
 * const handleSubmit = () => {
 *   const remaining = rateLimiter.getRemainingInWindow();
 *   if (remaining > 0) {
 *     console.log(`${remaining} updates remaining in this window`);
 *   } else {
 *     console.log('Rate limit reached for this window');
 *   }
 * };
 * ```
 */
export function useRateLimitedValue<TValue>(
  value: TValue,
  options: RateLimiterOptions<
    React.Dispatch<React.SetStateAction<TValue>>,
    [value: React.SetStateAction<TValue>]
  >,
) {
  const [rateLimitedValue, setRateLimitedValue, rateLimiter] =
    useRateLimitedState(value, options)

  useEffect(() => {
    setRateLimitedValue(value)
  }, [value, setRateLimitedValue])

  return [rateLimitedValue, rateLimiter] as const
}
