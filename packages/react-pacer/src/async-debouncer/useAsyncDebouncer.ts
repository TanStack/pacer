import { useRef } from 'react'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'

/**
 * A low-level React hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).
 *
 * Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
 * This is useful for handling fast-changing inputs like search fields, form validation, or any scenario where you want to
 * wait for user input to settle before making expensive async calls.
 *
 * The hook returns an object containing:
 * - maybeExecute: The debounced async function that respects the configured delay
 * - cancel: A function to cancel any pending delayed execution
 * - getExecutionCount: A function that returns the number of times the debounced function has executed
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
 *   }
 * );
 * ```
 */

export function useAsyncDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncDebouncerOptions): AsyncDebouncer<TFn, TArgs> {
  const asyncDebouncerRef = useRef<AsyncDebouncer<TFn, TArgs>>(null)

  if (!asyncDebouncerRef.current) {
    asyncDebouncerRef.current = new AsyncDebouncer(fn, options)
  }

  return {
    maybeExecute: asyncDebouncerRef.current.maybeExecute.bind(
      asyncDebouncerRef.current,
    ),
    cancel: asyncDebouncerRef.current.cancel.bind(asyncDebouncerRef.current),
    getExecutionCount: asyncDebouncerRef.current.getExecutionCount.bind(
      asyncDebouncerRef.current,
    ),
  } as AsyncDebouncer<TFn, TArgs>
}
