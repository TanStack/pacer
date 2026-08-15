import { createEffect } from 'solid-js'
import { createRateLimitedSignal } from './createRateLimitedSignal'
import type {
  SolidRateLimiter,
  SolidRateLimiterOptions,
} from './createRateLimiter'
import type { Accessor, Setter } from 'solid-js'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

/**
 * A high-level Solid hook that creates a rate-limited version of a value that updates at most a certain number of times within a time window.
 * This hook uses Solid's createSignal internally to manage the rate-limited state.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
 * subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
 * or intelligently collapse updates. This can lead to bursts of rapid updates followed by periods of no updates.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All updates within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows updates as old ones expire. This provides a more
 *   consistent rate of updates over time.
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
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management via the underlying rate limiter instance.
 * The `selector` parameter allows you to specify which rate limiter state changes will trigger reactive updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary reactive updates and gives you
 * full control over when your component subscribes to state changes. Only when you provide a selector will
 * the reactive system track the selected state values.
 *
 * Available rate limiter state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(rawValue, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding'
 * });
 *
 * // Opt-in to reactive updates when execution count changes (optimized for tracking successful updates)
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(
 *   rawValue,
 *   { limit: 5, window: 60000, windowType: 'sliding' },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Opt-in to reactive updates when rejection count changes (optimized for tracking rate limit violations)
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(
 *   rawValue,
 *   { limit: 5, window: 60000, windowType: 'sliding' },
 *   (state) => ({ rejectionCount: state.rejectionCount })
 * );
 *
 * // Opt-in to reactive updates when execution times change (optimized for window calculations)
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(
 *   rawValue,
 *   { limit: 5, window: 60000, windowType: 'sliding' },
 *   (state) => ({ executionTimes: state.executionTimes })
 * );
 *
 * // With rejection callback and fixed window
 * const [rateLimitedValue, rateLimiter] = createRateLimitedValue(rawValue, {
 *   limit: 3,
 *   window: 5000,
 *   windowType: 'fixed',
 *   onReject: (rateLimiter) => {
 *     console.log(`Update rejected. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // Access the selected rate limiter state (will be empty object {} unless selector provided)
 * const { executionCount, rejectionCount } = rateLimiter.state;
 * ```
 */
export function createRateLimitedValue<TValue, TSelected = {}>(
  value: Accessor<TValue>,
  initialOptions: SolidRateLimiterOptions<Setter<TValue>, TSelected>,
  selector?: (state: RateLimiterState) => TSelected,
): [Accessor<TValue>, SolidRateLimiter<Setter<TValue>, TSelected>] {
  const [rateLimitedValue, setRateLimitedValue, rateLimiter] =
    createRateLimitedSignal(value(), initialOptions, selector)

  createEffect(() => {
    setRateLimitedValue(value() as any)
  })

  return [rateLimitedValue, rateLimiter]
}
