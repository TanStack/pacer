import { useEffect, useMemo, useState } from 'react'
import { AsyncRetryer } from '@tanstack/pacer/async-retryer'
import { useStore } from '@tanstack/react-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/react-store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRetryerOptions,
  AsyncRetryerState,
} from '@tanstack/pacer/async-retryer'

export interface ReactAsyncRetryer<TFn extends AnyAsyncFunction, TSelected = {}>
  extends Omit<AsyncRetryer<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the retryer state changes
   *
   * Use this instead of `retryer.store.state`
   */
  readonly state: Readonly<TSelected>
  /**
   * @deprecated Use `retryer.state` instead of `retryer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncRetryerState<TFn>>>
}

/**
 * A low-level React hook that creates an `AsyncRetryer` instance to retry execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a retryer instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
 *
 * ## Retrying Concepts
 *
 * Async retrying automatically re-executes a failed async function up to a specified number of attempts with
 * configurable backoff strategies. This is useful for handling transient errors like network failures, temporary
 * server issues, or rate limiting where you want to automatically retry the operation.
 *
 * - **Backoff Strategies**: Controls the delay between retry attempts (default: `'exponential'`):
 *   - `'exponential'`: Wait time doubles with each attempt (1s, 2s, 4s, ...) - **DEFAULT**
 *   - `'linear'`: Wait time increases linearly (1s, 2s, 3s, ...)
 *   - `'fixed'`: Waits a constant amount of time (`baseWait`) between each attempt
 * - **Jitter**: Adds randomness to retry delays to prevent thundering herd problems (default: `0`).
 *   Set to a value between 0-1 to apply that percentage of random variation to each delay.
 * - **Timeout Controls**: Set limits on execution time to prevent hanging operations:
 *   - `maxExecutionTime`: Maximum time for a single function call (default: `Infinity`)
 *   - `maxTotalExecutionTime`: Maximum time for the entire retry operation (default: `Infinity`)
 * - **Abort & Cancellation**: Call `abort()` on the retryer to cancel ongoing execution and pending retries.
 *
 * ## Error Handling
 *
 * The `throwOnError` option controls when errors are thrown (default: `'last'`):
 * - `'last'`: Only throws the final error after all retries are exhausted - **DEFAULT**
 * - `true`: Throws every error immediately (disables retrying)
 * - `false`: Never throws errors, returns `undefined` instead
 *
 * Callbacks for error handling:
 * - `onError`: Called for every error (including during retries)
 * - `onLastError`: Called only for the final error after all retries fail
 * - `onRetry`: Called before each retry attempt
 * - `onSuccess`: Called when execution succeeds
 * - `onSettled`: Called after execution completes (success or failure)
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
 * - `currentAttempt`: The current retry attempt number (0 when not executing)
 * - `executionCount`: Total number of completed executions (successful or failed)
 * - `isExecuting`: Whether the retryer is currently executing the function
 * - `lastError`: The most recent error encountered during execution
 * - `lastExecutionTime`: Timestamp of the last execution completion in milliseconds
 * - `lastResult`: The result from the most recent successful execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'executing' | 'retrying')
 * - `totalExecutionTime`: Total time spent executing (including retries) in milliseconds
 *
 * ## Cleanup
 *
 * The hook automatically calls `abort()` on unmount to cancel any ongoing execution.
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const apiRetryer = useAsyncRetryer(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   { maxAttempts: 3, backoff: 'exponential' }
 * );
 *
 * // With advanced retry configuration
 * const apiRetryer = useAsyncRetryer(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   {
 *     maxAttempts: 5,
 *     backoff: 'exponential',
 *     baseWait: 1000,
 *     jitter: 0.1, // Add 10% random variation to prevent thundering herd
 *     maxExecutionTime: 5000, // Abort individual calls after 5 seconds
 *     maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
 *   }
 * );
 *
 * // Opt-in to re-render when execution state changes (optimized for loading indicators)
 * const apiRetryer = useAsyncRetryer(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   { maxAttempts: 3, backoff: 'exponential' },
 *   (state) => ({
 *     isExecuting: state.isExecuting,
 *     currentAttempt: state.currentAttempt
 *   })
 * );
 *
 * // Opt-in to re-render when results are available (optimized for data display)
 * const apiRetryer = useAsyncRetryer(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   { maxAttempts: 3, backoff: 'exponential' },
 *   (state) => ({
 *     lastResult: state.lastResult,
 *     executionCount: state.executionCount
 *   })
 * );
 *
 * // Opt-in to re-render when error state changes (optimized for error handling)
 * const apiRetryer = useAsyncRetryer(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   {
 *     maxAttempts: 3,
 *     backoff: 'exponential',
 *     onError: (error) => console.error('API call failed:', error),
 *     onLastError: (error) => console.error('All retries failed:', error),
 *     onRetry: (attempt, error) => console.log(`Retry attempt ${attempt} after error:`, error),
 *   },
 *   (state) => ({
 *     lastError: state.lastError,
 *     status: state.status
 *   })
 * );
 *
 * // With state management
 * const [userData, setUserData] = useState(null);
 * const { execute, state } = useAsyncRetryer(
 *   async (userId) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     const data = await response.json();
 *     setUserData(data);
 *     return data;
 *   },
 *   {
 *     maxAttempts: 5,
 *     backoff: 'exponential',
 *     baseWait: 1000,
 *     onRetry: (attempt, error) => {
 *       console.log(`Retry attempt ${attempt} after error:`, error);
 *     },
 *     onError: (error) => {
 *       console.error('Request failed:', error);
 *     }
 *   }
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isExecuting, currentAttempt } = state;
 * ```
 */
export function useAsyncRetryer<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: AsyncRetryerOptions<TFn>,
  selector: (state: AsyncRetryerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): ReactAsyncRetryer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncRetryer,
    ...options,
  } as AsyncRetryerOptions<TFn>

  const [asyncRetryer] = useState(
    () => new AsyncRetryer<TFn>(fn, mergedOptions),
  )

  asyncRetryer.fn = fn
  asyncRetryer.setOptions(mergedOptions)

  const state = useStore(asyncRetryer.store, selector)

  useEffect(() => {
    return () => {
      asyncRetryer.abort()
    }
  }, [asyncRetryer])

  return useMemo(
    () =>
      ({
        ...asyncRetryer,
        state,
      }) as ReactAsyncRetryer<TFn, TSelected>, // omit `store` in favor of `state`
    [asyncRetryer, state],
  )
}
