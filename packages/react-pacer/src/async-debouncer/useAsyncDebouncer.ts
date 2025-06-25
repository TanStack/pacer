import { useCallback, useEffect, useMemo, useState } from 'react'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'

interface ReactAsyncDebouncerOptions<TFn extends AnyAsyncFunction>
  extends AsyncDebouncerOptions<TFn> {
  enableStateRerenders?: boolean
}

interface ReactAsyncDebouncer<TFn extends AnyAsyncFunction>
  extends Omit<AsyncDebouncer<TFn>, 'getState'> {
  state: AsyncDebouncerState<TFn>
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
export function useAsyncDebouncer<TFn extends AnyAsyncFunction>(
  fn: TFn,
  {
    enableStateRerenders = true,
    onStateChange,
    ...options
  }: ReactAsyncDebouncerOptions<TFn>,
): ReactAsyncDebouncer<TFn> {
  const [asyncDebouncer] = useState(() =>
    bindInstanceMethods(new AsyncDebouncer<TFn>(fn, options)),
  )

  const [state, setState] = useState(asyncDebouncer.getState())

  const setOptions = useCallback(
    (newOptions: Partial<AsyncDebouncerOptions<TFn>>) => {
      asyncDebouncer.setOptions({
        ...newOptions,
        onStateChange: (state, asyncDebouncer) => {
          if (enableStateRerenders) {
            setState(state)
          }
          const _onStateChange = newOptions.onStateChange ?? onStateChange
          _onStateChange?.(state, asyncDebouncer)
        },
      })
    },
    [asyncDebouncer, enableStateRerenders, onStateChange],
  )

  setOptions(options)

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
        setOptions,
      }) as ReactAsyncDebouncer<TFn>,
    [asyncDebouncer, state, setOptions],
  )
}
