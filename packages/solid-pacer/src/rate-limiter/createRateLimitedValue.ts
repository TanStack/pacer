import { createEffect } from 'solid-js'
import { createRateLimitedSignal } from './createRateLimitedSignal'
import type { SolidRateLimiter } from './createRateLimiter'
import type { Accessor, Setter } from 'solid-js'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

/**
 * A high-level Solid hook that creates a rate-limited version of a value that updates at most a certain number of times within a time window.
 * This hook uses Solid's createSignal internally to manage the rate-limited state.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
 * subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
 * or intelligently collapse updates. This can lead to bursts of rapid updates followed by periods of no updates.
 *
 * For smoother update patterns, consider:
 * - createThrottledValue: When you want consistent spacing between updates (e.g. UI changes)
 * - createDebouncedValue: When you want to collapse rapid updates into a single update (e.g. search input)
 *
 * Rate limiting should primarily be used when you need to enforce strict limits, like API rate limits.
 *
 * The hook returns a tuple containing:
 * - An accessor function that provides the rate-limited value
 * - The rate limiter instance with control methods
 *
 * For more direct control over rate limiting behavior without Solid state management,
 * consider using the lower-level createRateLimiter hook instead.
 *
 * @example
 * ```tsx
 * // Basic rate limiting - update at most 5 times per minute
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(rawValue, {
 *   limit: 5,
 *   window: 60000
 * });
 *
 * // Use the rate-limited value
 * console.log(rateLimitedValue()); // Access the current rate-limited value
 *
 * // Control the rate limiter
 * rateLimiter.reset(); // Reset the rate limit window
 * ```
 */
export function createRateLimitedValue<TValue>(
  value: Accessor<TValue>,
  initialOptions: RateLimiterOptions<Setter<TValue>>,
): [Accessor<TValue>, SolidRateLimiter<Setter<TValue>>] {
  const [rateLimitedValue, setRateLimitedValue, rateLimiter] =
    createRateLimitedSignal(value(), initialOptions)

  createEffect(() => {
    setRateLimitedValue(value() as any)
  })

  return [rateLimitedValue, rateLimiter]
}
