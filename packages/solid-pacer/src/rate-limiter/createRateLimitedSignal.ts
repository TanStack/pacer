import { createSignal } from 'solid-js'
import { createRateLimiter } from './createRateLimiter'
import type { Accessor, Setter } from 'solid-js'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

/**
 * A Solid hook that creates a rate-limited state value that enforces a hard limit on state updates within a time window.
 * This hook combines Solid's createSignal with rate limiting functionality to provide controlled state updates.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
 * subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
 * or intelligently collapse updates. This can lead to bursts of rapid updates followed by periods of no updates.
 *
 * For smoother update patterns, consider:
 * - createThrottledSignal: When you want consistent spacing between updates (e.g. UI changes)
 * - createDebouncedSignal: When you want to collapse rapid updates into a single update (e.g. search input)
 *
 * Rate limiting should primarily be used when you need to enforce strict limits, like API rate limits.
 *
 * The hook returns a tuple containing:
 * - The rate-limited state value accessor
 * - A rate-limited setter function that respects the configured limits
 * - The rateLimiter instance for additional control
 *
 * For more direct control over rate limiting without state management,
 * consider using the lower-level createRateLimiter hook instead.
 *
 * @example
 * ```tsx
 * // Basic rate limiting - update state at most 5 times per minute
 * const [value, setValue, rateLimiter] = createRateLimitedSignal(0, {
 *   limit: 5,
 *   window: 60000
 * });
 *
 * // With rejection callback
 * const [value, setValue] = createRateLimitedSignal(0, {
 *   limit: 3,
 *   window: 5000,
 *   onReject: ({ msUntilNextWindow }) => {
 *     alert(`Rate limit reached. Try again in ${msUntilNextWindow}ms`);
 *   }
 * });
 *
 * // Access rateLimiter methods if needed
 * const handleSubmit = () => {
 *   const remaining = rateLimiter.getRemainingInWindow();
 *   if (remaining > 0) {
 *     setValue(newValue);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 * ```
 */

export function createRateLimitedSignal<TValue>(
  value: TValue,
  options: RateLimiterOptions<Setter<TValue>, [Accessor<TValue>]>,
) {
  const [rateLimitedValue, setRateLimitedValue] = createSignal<TValue>(value)
  const rateLimiter = createRateLimiter(setRateLimitedValue, options)
  return [
    rateLimitedValue,
    rateLimiter.maybeExecute.bind(rateLimiter) as Setter<TValue>,
    rateLimiter,
  ] as const
}
