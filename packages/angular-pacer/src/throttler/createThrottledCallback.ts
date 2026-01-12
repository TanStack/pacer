import { createThrottler } from './createThrottler'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates a throttled version of a callback function.
 * This function is essentially a wrapper around `createThrottler` that provides
 * a simplified API for basic throttling needs.
 *
 * The throttled function will execute at most once within the specified wait time.
 * If called multiple times within the wait period, only the first call (if leading is enabled)
 * or the last call (if trailing is enabled) will execute.
 *
 * This function provides a simpler API compared to `createThrottler`, making it ideal for basic
 * throttling needs. However, it does not expose the underlying Throttler instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - State tracking
 *
 * Consider using the `createThrottler` function instead.
 *
 * @example
 * ```ts
 * // Throttle a scroll handler
 * const handleScroll = createThrottledCallback((scrollY: number) => {
 *   updateScrollPosition(scrollY);
 * }, {
 *   wait: 100 // Execute at most once per 100ms
 * });
 *
 * // Use in an event listener
 * window.addEventListener('scroll', () => {
 *   handleScroll(window.scrollY);
 * });
 * ```
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
): (...args: Parameters<TFn>) => void {
  const throttler = createThrottler(fn, options)
  return (...args: Parameters<TFn>) => throttler.maybeExecute(...args)
}
