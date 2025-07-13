import { useCallback } from 'react'
import { useRateLimiter } from './useRateLimiter'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

/**
 * A React hook that creates a rate-limited version of a callback function.
 * This hook is essentially a wrapper around the basic `rateLimiter` function
 * that is exported from `@tanstack/pacer`,
 * but optimized for React with reactive options and a stable function reference.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all calls until the limit
 * is reached, then blocks subsequent calls until the window resets. Unlike throttling
 * or debouncing, it does not attempt to space out or intelligently collapse calls.
 * This can lead to bursts of rapid executions followed by periods where all calls
 * are blocked.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * For smoother execution patterns, consider:
 * - useThrottledCallback: When you want consistent spacing between executions (e.g. UI updates)
 * - useDebouncedCallback: When you want to collapse rapid calls into a single execution (e.g. search input)
 *
 * Rate limiting should primarily be used when you need to enforce strict limits,
 * like API rate limits or other scenarios requiring hard caps on execution frequency.
 *
 * This hook provides a simpler API compared to `useRateLimiter`, making it ideal for basic
 * rate limiting needs. However, it does not expose the underlying RateLimiter instance.
 *
 * ## State Management and Re-renders
 *
 * **By default, this callback hook disables re-renders from internal rate limiter state changes**
 * for optimal performance. The callback function reference remains stable regardless of
 * internal state changes. However, you can opt into re-renders by providing a custom
 * `selector` function that returns the specific state values you want to track.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Custom useCallback dependencies
 *
 * Consider using the `useRateLimiter` hook instead.
 *
 * @example
 * ```tsx
 * // Rate limit API calls to maximum 5 calls per minute with a sliding window (no re-renders from internal state)
 * const makeApiCall = useRateLimitedCallback(
 *   (data: ApiData) => {
 *     return fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
 *   },
 *   {
 *     limit: 5,
 *     window: 60000, // 1 minute
 *     windowType: 'sliding',
 *     onReject: () => {
 *       console.warn('API rate limit reached. Please wait before trying again.');
 *     }
 *   }
 * );
 *
 * // Opt into re-renders when rejection count changes
 * const makeApiCall = useRateLimitedCallback(
 *   (data: ApiData) => {
 *     return fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
 *   },
 *   { limit: 5, window: 60000, windowType: 'sliding' },
 *   (state) => ({ rejectionCount: state.rejectionCount })
 * );
 * ```
 */
export function useRateLimitedCallback<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
  selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
): (...args: Parameters<TFn>) => boolean {
  const rateLimitedFn = useRateLimiter(fn, options, selector).maybeExecute
  return useCallback((...args) => rateLimitedFn(...args), [rateLimitedFn])
}
