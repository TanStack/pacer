import { useCallback } from 'react'
import { useAsyncThrottler } from './useAsyncThrottler'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * A React hook that creates a throttled version of an async callback function.
 * This hook is a convenient wrapper around the `useAsyncThrottler` hook,
 * providing a stable, throttled async function reference for use in React components.
 *
 * The throttled async function will execute at most once within the specified wait time period,
 * regardless of how many times it is called. If called multiple times during the wait period,
 * only the first invocation will execute, and subsequent calls will be ignored until
 * the wait period has elapsed. The returned function always returns a promise
 * that resolves or rejects with the result of the original async function.
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
 * ## State Management and Re-renders
 *
 * **By default, this callback hook disables re-renders from internal state changes for optimal performance.**
 * The hook uses TanStack Store internally but doesn't subscribe to state changes, preventing
 * unnecessary re-renders when the async throttler's internal state updates.
 *
 * If you need to react to state changes (like showing loading indicators or error states),
 * you can provide a custom `selector` function to opt into specific state updates:
 *
 * ```tsx
 * // Default: No re-renders from state changes (optimal performance)
 * const throttledCallback = useAsyncThrottledCallback(asyncFn, { wait: 1000 });
 *
 * // Opt-in: Re-render when execution state changes
 * const throttledCallback = useAsyncThrottledCallback(
 *   asyncFn,
 *   { wait: 1000 },
 *   (state) => ({ isExecuting: state.isExecuting, lastError: state.lastError })
 * );
 * ```
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
export function useAsyncThrottledCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): (...args: Parameters<TFn>) => Promise<ReturnType<TFn>> {
  const asyncThrottledFn = useAsyncThrottler(fn, options, selector).maybeExecute
  return useCallback(
    (...args) => asyncThrottledFn(...args) as Promise<ReturnType<TFn>>,
    [asyncThrottledFn],
  )
}
