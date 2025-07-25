import { createSignal } from 'solid-js'
import { createRateLimiter } from './createRateLimiter'
import type { SolidRateLimiter } from './createRateLimiter'
import type { Accessor, Setter } from 'solid-js'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

/**
 * A Solid hook that creates a rate-limited state value that enforces a hard limit on state updates within a time window.
 * This hook combines Solid's createSignal with rate limiting functionality to provide controlled state updates.
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
 * - `callsInWindow`: Number of calls made in the current window
 * - `remainingInWindow`: Number of calls remaining in the current window
 * - `windowStart`: Unix timestamp when the current window started
 * - `nextWindowStart`: Unix timestamp when the next window will start
 * - `msUntilNextWindow`: Milliseconds until the next window starts
 * - `isAtLimit`: Whether the call limit for the current window has been reached
 * - `status`: Current status ('disabled' | 'idle' | 'at-limit')
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const [value, setValue, rateLimiter] = createRateLimitedSignal(0, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding'
 * });
 *
 * // Opt-in to reactive updates when limit state changes (optimized for UI feedback)
 * const [value, setValue, rateLimiter] = createRateLimitedSignal(
 *   0,
 *   { limit: 5, window: 60000 },
 *   (state) => ({ isAtLimit: state.isAtLimit, remainingInWindow: state.remainingInWindow })
 * );
 *
 * // With rejection callback and fixed window
 * const [value, setValue] = createRateLimitedSignal(0, {
 *   limit: 3,
 *   window: 5000,
 *   windowType: 'fixed',
 *   onReject: (rateLimiter) => {
 *     alert(`Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // Access rateLimiter state via signals
 * const handleSubmit = () => {
 *   const remaining = rateLimiter.state().remainingInWindow;
 *   if (remaining > 0) {
 *     setValue(newValue);
 *   } else {
 *     showRateLimitWarning();
 *   }
 * };
 * ```
 */
export function createRateLimitedSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: RateLimiterOptions<Setter<TValue>>,
  selector?: (state: RateLimiterState) => TSelected,
): [
  Accessor<TValue>,
  Setter<TValue>,
  SolidRateLimiter<Setter<TValue>, TSelected>,
] {
  const [rateLimitedValue, setRateLimitedValue] = createSignal<TValue>(value)

  const rateLimiter = createRateLimiter(
    setRateLimitedValue,
    initialOptions,
    selector,
  )

  return [
    rateLimitedValue,
    rateLimiter.maybeExecute as Setter<TValue>,
    rateLimiter,
  ]
}
