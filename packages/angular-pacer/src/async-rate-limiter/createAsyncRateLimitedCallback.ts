import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type { AsyncRateLimiterOptions } from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates an async rate-limited version of a callback function.
 * This function is essentially a wrapper around `createAsyncRateLimiter` that provides
 * a simplified API for basic async rate limiting needs.
 *
 * This function provides a simpler API compared to `createAsyncRateLimiter`, making it ideal for basic
 * async rate limiting needs. However, it does not expose the underlying AsyncRateLimiter instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation/reset
 * - Access to execution counts
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `createAsyncRateLimiter` function instead.
 *
 * @example
 * ```ts
 * // Rate limit API calls
 * const makeApiCall = createAsyncRateLimitedCallback(
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
export function createAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const rateLimiter = createAsyncRateLimiter(fn, options)
  return (...args: Parameters<TFn>) => rateLimiter.maybeExecute(...args)
}

