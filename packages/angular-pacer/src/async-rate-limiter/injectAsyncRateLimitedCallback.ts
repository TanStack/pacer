import { injectAsyncRateLimiter } from './injectAsyncRateLimiter'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates an async rate-limited version of a callback function.
 * This function is essentially a wrapper around `injectAsyncRateLimiter` that provides
 * a simplified API for basic async rate limiting needs.
 *
 * This function provides a simpler API compared to `injectAsyncRateLimiter`, making it ideal for basic
 * async rate limiting needs. However, it does not expose the underlying AsyncRateLimiter instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation/reset
 * - Access to execution counts
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `injectAsyncRateLimiter` function instead.
 *
 * @example
 * ```ts
 * // Rate limit API calls
 * const makeApiCall = injectAsyncRateLimitedCallback(
 *   async (data: ApiData) => {
 *     const response = await fetch('/api/endpoint', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   },
 *   {
 *     limit: 5,
 *     window: 60000,
 *     windowType: 'sliding',
 *   }
 * );
 *
 * // Use in event handler
 * const result = await makeApiCall(apiData);
 * ```
 */
export function injectAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const rateLimiter = injectAsyncRateLimiter(fn, options)
  return async (...args: Parameters<TFn>) => {
    const result = await rateLimiter.maybeExecute(...args)
    return result !== undefined ? await result : undefined
  }
}
