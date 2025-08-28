import { useEffect, useMemo, useState } from 'react'
import { AsyncRetryer } from '@tanstack/pacer/async-retryer'
import { useStore } from '@tanstack/react-store'
import type { Store } from '@tanstack/react-store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRetryerOptions,
  AsyncRetryerState,
} from '@tanstack/pacer/async-retryer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'

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
 * Async retrying automatically re-executes a failed async function up to a specified number of attempts with
 * configurable backoff strategies. This is useful for handling transient errors like network failures, temporary
 * server issues, or rate limiting where you want to automatically retry the operation.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called for every error during execution
 * - If an `onLastError` handler is provided, it will be called only for the final error after all retries fail
 * - If `throwOnError` is 'last' (default), only the final error after all retries will be thrown
 * - If `throwOnError` is true, every error will be thrown immediately (disables retrying)
 * - If `throwOnError` is false, errors are never thrown and undefined is returned instead
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
 *     onLastError: (error) => console.error('All retries failed:', error)
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
      asyncRetryer.cancel()
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
