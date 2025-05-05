import { useCallback } from 'react'
import { useRateLimiter } from './useRateLimiter'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

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
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Custom useCallback dependencies
 *
 * Consider using the `useRateLimiter` hook instead.
 *
 * @example
 * ```tsx
 * // Rate limit API calls to maximum 5 calls per minute
 * const makeApiCall = useRateLimitedCallback(
 *   (data: ApiData) => {
 *     return fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
 *   },
 *   {
 *     limit: 5,
 *     window: 60000, // 1 minute
 *     onReject: () => {
 *       console.warn('API rate limit reached. Please wait before trying again.');
 *     }
 *   }
 * );
 * ```
 */
export function useRateLimitedCallback<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions<TFn>) {
  const rateLimitedFn = useRateLimiter<TFn>(fn, options).maybeExecute
  return useCallback(
    (...args: TArgs) => rateLimitedFn(...args),
    [rateLimitedFn],
  )
}
