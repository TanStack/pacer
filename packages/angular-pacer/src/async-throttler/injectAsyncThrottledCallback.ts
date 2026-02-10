import { injectAsyncThrottler } from './injectAsyncThrottler'
import type { AsyncThrottlerOptions } from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates an async throttled version of a callback function.
 * This function is essentially a wrapper around `injectAsyncThrottler` that provides
 * a simplified API for basic async throttling needs.
 *
 * The throttled function will execute at most once within the specified wait time.
 *
 * This function provides a simpler API compared to `injectAsyncThrottler`, making it ideal for basic
 * async throttling needs. However, it does not expose the underlying AsyncThrottler instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `injectAsyncThrottler` function instead.
 *
 * @example
 * ```ts
 * // Throttle an async update handler
 * const handleUpdate = injectAsyncThrottledCallback(
 *   async (data: Data) => {
 *     const response = await fetch('/api/update', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   },
 *   { wait: 1000 }
 * );
 *
 * // Use in an event handler
 * const result = await handleUpdate(updateData);
 * ```
 */
export function injectAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const throttler = injectAsyncThrottler(fn, options)
  return async (...args: Parameters<TFn>) => {
    const result = await throttler.maybeExecute(...args)
    return result !== undefined ? await result : undefined
  }
}
