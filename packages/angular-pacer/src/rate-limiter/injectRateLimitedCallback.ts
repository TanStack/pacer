import { injectRateLimiter } from './injectRateLimiter'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates a rate-limited version of a callback function.
 * This function is essentially a wrapper around `injectRateLimiter` that provides
 * a simplified API for basic rate limiting needs.
 *
 * Rate limiting is a simple "hard limit" approach - it allows all calls until the limit
 * is reached, then blocks subsequent calls until the window resets. Unlike throttling
 * or debouncing, it does not attempt to space out or intelligently collapse calls.
 *
 * This function provides a simpler API compared to `injectRateLimiter`, making it ideal for basic
 * rate limiting needs. However, it does not expose the underlying RateLimiter instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation/reset
 * - Access to execution counts
 * - State tracking
 *
 * Consider using the `injectRateLimiter` function instead.
 *
 * @example
 * ```ts
 * // Rate limit API calls to maximum 5 calls per minute
 * const makeApiCall = injectRateLimitedCallback(
 *   (data: ApiData) => {
 *     return fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
 *   },
 *   {
 *     limit: 5,
 *     window: 60000, // 1 minute
 *     windowType: 'sliding',
 *   }
 * );
 * ```
 */
export function injectRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
): (...args: Parameters<TFn>) => boolean {
  const rateLimiter = injectRateLimiter(fn, options)
  return (...args: Parameters<TFn>) => rateLimiter.maybeExecute(...args)
}
