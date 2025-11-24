import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { useStore } from '@tanstack/solid-store'
import { createEffect, onCleanup } from 'solid-js'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

export interface SolidAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'store'> {
  /**
   * Reactive state that will be updated when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>
}

/**
 * A low-level Solid hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
 * Each new invocation resets the delay timer. This is useful for handling frequent events like window resizing
 * or input changes where you only want to execute the handler after the events have stopped occurring.
 *
 * Unlike throttling which allows execution at regular intervals, debouncing prevents any execution until
 * the function stops being called for the specified delay period.
 *
 * Unlike the non-async Debouncer, this async version supports returning values from the debounced function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the debounced function.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and debouncer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncDebouncer instance
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
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `hasError`: Whether the last execution resulted in an error
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `isExecuting`: Whether an async function execution is currently in progress
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastError`: The error from the most recent failed execution (if any)
 * - `lastResult`: The result from the most recent successful execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing')
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const { maybeExecute } = createAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 }
 * );
 *
 * // Opt-in to re-render when isPending or isExecuting changes (optimized for loading states)
 * const debouncer = createAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })
 * );
 *
 * // Opt-in to re-render when error state changes (optimized for error handling)
 * const debouncer = createAsyncDebouncer(
 *   async (searchTerm) => {
 *     const data = await searchAPI(searchTerm);
 *     return data;
 *   },
 *   {
 *     wait: 300,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false, // Skip trailing edge updates
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     }
 *   },
 *   (state) => ({ hasError: state.hasError, lastError: state.lastError })
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending, isExecuting } = debouncer.state();
 * ```
 */
export function createAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SolidAsyncDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncDebouncer,
    ...options,
  } as AsyncDebouncerOptions<TFn>

  const asyncDebouncer = new AsyncDebouncer<TFn>(fn, mergedOptions)

  const state = useStore(asyncDebouncer.store, selector)

  createEffect(() => {
    onCleanup(() => {
      asyncDebouncer.cancel()
    })
  })

  return {
    ...asyncDebouncer,
    state,
  } as SolidAsyncDebouncer<TFn, TSelected> // omit `store` in favor of `state`
}
