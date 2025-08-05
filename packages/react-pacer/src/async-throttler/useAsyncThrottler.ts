import { useEffect, useMemo, useState } from 'react'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useStore } from '@tanstack/react-store'
import type { Store } from '@tanstack/react-store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

export interface ReactAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Readonly<TSelected>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>
}

/**
 * A low-level React hook that creates an `AsyncThrottler` instance to limit how often an async function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
 *
 * Async throttling ensures an async function executes at most once within a specified time window,
 * regardless of how many times it is called. This is useful for rate-limiting expensive API calls,
 * database operations, or other async tasks.
 *
 * Unlike the non-async Throttler, this async version supports returning values from the throttled function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the throttled function.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and throttler instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncThrottler instance
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
 * to specify which state changes will trigger a re-render, optimizing performance by preventing
 * unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
 *
 * Available state properties:
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the throttled function is currently executing asynchronously
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last function execution in milliseconds
 * - `lastResult`: The result from the most recent successful function execution
 * - `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
 * - `settleCount`: Number of function executions that have completed (success or error)
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
 * - `successCount`: Number of function executions that have completed successfully
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const asyncThrottler = useAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data; // Return value is preserved
 *   },
 *   { wait: 1000 }
 * );
 *
 * // Opt-in to re-render when execution state changes (optimized for loading indicators)
 * const asyncThrottler = useAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { wait: 1000 },
 *   (state) => ({
 *     isExecuting: state.isExecuting,
 *     isPending: state.isPending,
 *     status: state.status
 *   })
 * );
 *
 * // Opt-in to re-render when results are available (optimized for data display)
 * const asyncThrottler = useAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { wait: 1000 },
 *   (state) => ({
 *     lastResult: state.lastResult,
 *     successCount: state.successCount,
 *     settleCount: state.settleCount
 *   })
 * );
 *
 * // Opt-in to re-render when error state changes (optimized for error handling)
 * const asyncThrottler = useAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   {
 *     wait: 1000,
 *     onError: (error) => console.error('API call failed:', error)
 *   },
 *   (state) => ({
 *     errorCount: state.errorCount,
 *     status: state.status
 *   })
 * );
 *
 * // Opt-in to re-render when timing information changes (optimized for timing displays)
 * const asyncThrottler = useAsyncThrottler(
 *   async (id: string) => {
 *     const data = await api.fetchData(id);
 *     return data;
 *   },
 *   { wait: 1000 },
 *   (state) => ({
 *     lastExecutionTime: state.lastExecutionTime,
 *     nextExecutionTime: state.nextExecutionTime
 *   })
 * );
 *
 * // With state management and return value
 * const [data, setData] = useState(null);
 * const { maybeExecute, state } = useAsyncThrottler(
 *   async (query) => {
 *     const result = await searchAPI(query);
 *     setData(result);
 *     return result; // Return value can be used by the caller
 *   },
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isExecuting, lastResult } = state;
 * ```
 */
export function useAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): ReactAsyncThrottler<TFn, TSelected> {
  const [asyncThrottler] = useState(() => new AsyncThrottler<TFn>(fn, options))

  const state = useStore(asyncThrottler.store, selector)

  asyncThrottler.fn = fn
  asyncThrottler.setOptions(options)

  useEffect(() => {
    return () => asyncThrottler.cancel()
  }, [asyncThrottler])

  return useMemo(
    () =>
      ({
        ...asyncThrottler,
        state,
      }) as ReactAsyncThrottler<TFn, TSelected>, // omit `store` in favor of `state`
    [asyncThrottler, state],
  )
}
