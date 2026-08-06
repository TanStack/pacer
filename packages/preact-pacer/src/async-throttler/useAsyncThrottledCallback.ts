import { useCallback } from 'preact/hooks'
import { useAsyncThrottler } from './useAsyncThrottler'
import type { PreactAsyncThrottlerOptions } from './useAsyncThrottler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * A Preact hook that creates a throttled version of an async callback function.
 * This hook is a convenient wrapper around the `useAsyncThrottler` hook,
 * providing a stable, throttled async function reference for use in Preact components.
 *
 * The throttled async function will execute at most once within the specified wait time period,
 * regardless of how many times it is called. Calls made during the wait period can schedule a
 * single trailing execution with the latest arguments when `trailing` is enabled (the default),
 * and those calls share the trailing execution's result. The returned function always returns
 * a promise that resolves or rejects with the result of the original async function, and
 * resolves with `undefined` when the throttler is disabled.
 *
 * This hook provides a simpler API compared to `useAsyncThrottler`, making it ideal for basic
 * async throttling needs. However, it does not expose the underlying AsyncThrottler instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution/error state
 * - Custom useCallback dependencies
 *
 * Consider using the `useAsyncThrottler` hook instead.
 *
 *
 * @example
 * ```tsx
 * // Throttle an async API call
 * const handleApiCall = useAsyncThrottledCallback(async (data) => {
 *   const result = await sendDataToServer(data);
 *   return result;
 * }, {
 *   wait: 200 // Execute at most once every 200ms
 * });
 *
 * // Use in an event handler
 * <button onClick={() => handleApiCall(formData)}>Send</button>
 * ```
 */
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: PreactAsyncThrottlerOptions<TFn, {}>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const asyncThrottledFn = useAsyncThrottler(fn, options).maybeExecute
  return useCallback(
    (...args: Parameters<TFn>) => asyncThrottledFn(...args),
    [asyncThrottledFn],
  )
}
