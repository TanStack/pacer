import { createMemo, createSignal } from 'solid-js'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'

/**
 * A low-level Solid hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (createSignal, Redux, Zustand, Jotai, etc).
 *
 * Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
 * This is useful for handling fast-changing inputs like search fields, form validation, or any scenario where you want to
 * wait for user input to settle before making expensive async calls.
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
 * const [results, setResults] = createSignal([]);
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
>(fn: TFn, options: AsyncDebouncerOptions) {
  const [asyncDebouncer] = createSignal(
    () => new AsyncDebouncer<TFn, TArgs>(fn, options),
  )

  const setOptions = createMemo(() =>
    asyncDebouncer()().setOptions.bind(asyncDebouncer),
  )

  setOptions()(options)

  return createMemo(
    () =>
      ({
        maybeExecute: asyncDebouncer()().maybeExecute.bind(asyncDebouncer),
        cancel: asyncDebouncer()().cancel.bind(asyncDebouncer),
        getExecutionCount:
          asyncDebouncer()().getExecutionCount.bind(asyncDebouncer),
      }) as const,
  )
}
