import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { Accessor } from 'solid-js'

export interface SolidAsyncDebouncer<TFn extends AnyAsyncFunction>
  extends Omit<
    AsyncDebouncer<TFn>,
    | 'getErrorCount'
    | 'getIsPending'
    | 'getLastResult'
    | 'getSettleCount'
    | 'getSuccessCount'
  > {
  errorCount: Accessor<number>
  isPending: Accessor<boolean>
  lastResult: Accessor<ReturnType<TFn> | undefined>
  settleCount: Accessor<number>
  successCount: Accessor<number>
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
 * @example
 * ```tsx
 * // Basic API call debouncing
 * const { maybeExecute } = createAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     return results;
 *   },
 *   { wait: 500 }
 * );
 *
 * // With state management
 * const [results, setResults] = createSignal([]);
 * const { maybeExecute } = createAsyncDebouncer(
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
export function createAsyncDebouncer<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncDebouncerOptions<TFn>,
): SolidAsyncDebouncer<TFn> {
  const asyncDebouncer = new AsyncDebouncer<TFn>(fn, initialOptions)

  const [errorCount, setErrorCount] = createSignal(
    asyncDebouncer.getErrorCount(),
  )
  const [settleCount, setSettleCount] = createSignal(
    asyncDebouncer.getSettleCount(),
  )
  const [successCount, setSuccessCount] = createSignal(
    asyncDebouncer.getSuccessCount(),
  )
  const [isPending, setIsPending] = createSignal(asyncDebouncer.getIsPending())
  const [lastResult, setLastResult] = createSignal(
    asyncDebouncer.getLastResult(),
  )

  function setOptions(newOptions: Partial<AsyncDebouncerOptions<TFn>>) {
    asyncDebouncer.setOptions({
      ...newOptions,
      onSettled: (asyncDebouncer) => {
        setSuccessCount(asyncDebouncer.getSuccessCount())
        setErrorCount(asyncDebouncer.getErrorCount())
        setSettleCount(asyncDebouncer.getSettleCount())
        setIsPending(asyncDebouncer.getIsPending())
        setLastResult(asyncDebouncer.getLastResult())
        const onSettled = newOptions.onSettled ?? initialOptions.onSettled
        onSettled?.(asyncDebouncer)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...bindInstanceMethods(asyncDebouncer),
    errorCount,
    isPending,
    lastResult,
    settleCount,
    successCount,
    setOptions,
  } as SolidAsyncDebouncer<TFn>
}
