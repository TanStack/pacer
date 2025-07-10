import { useEffect, useMemo, useState } from 'react'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { useStore } from '@tanstack/react-store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'

export interface ReactAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = AsyncDebouncerState<TFn>,
> extends Omit<AsyncDebouncer<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Readonly<TSelected>
}

/**
 * A low-level React hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
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
 * @example
 * ```tsx
 * // Basic API call debouncing
 * const { maybeExecute } = useAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 }
 * );
 *
 * // With state management
 * const [results, setResults] = useState([]);
 * const { maybeExecute } = useAsyncDebouncer(
 *   async (searchTerm) => {
 *     const data = await searchAPI(searchTerm);
 *     setResults(data);
 *   },
 *   {
 *     wait: 300,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false, // Skip trailing edge updates
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     }
 *   }
 * );
 * ```
 */
export function useAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = AsyncDebouncerState<TFn>,
>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
  selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
): ReactAsyncDebouncer<TFn, TSelected> {
  const [asyncDebouncer] = useState(() => new AsyncDebouncer<TFn>(fn, options))

  const state = useStore(asyncDebouncer.store, selector)

  asyncDebouncer.setOptions(options)

  useEffect(() => {
    return () => {
      asyncDebouncer.cancel()
    }
  }, [asyncDebouncer])

  return useMemo(
    () =>
      ({
        ...asyncDebouncer,
        state,
      }) as unknown as ReactAsyncDebouncer<TFn, TSelected>, // omit `store` in favor of `state`
    [asyncDebouncer, state],
  )
}
