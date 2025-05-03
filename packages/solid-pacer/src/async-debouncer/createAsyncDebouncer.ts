import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { Accessor } from 'solid-js'

export interface SolidAsyncDebouncer<TFn extends AnyAsyncFunction>
  extends Omit<AsyncDebouncer<TFn>, 'getExecutionCount' | 'getIsPending'> {
  executionCount: Accessor<number>
  isPending: Accessor<boolean>
}

/**
 * A low-level Solid hook that creates an `AsyncDebouncer` instance to delay execution of an async function.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
 * you can integrate with any state management solution (createSignal, etc).
 *
 * Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
 * This is useful for handling fast-changing inputs like search fields, form validation, or any scenario where you want to
 * wait for user input to settle before making expensive async calls.
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
 *   }
 * );
 * ```
 */

export function createAsyncDebouncer<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncDebouncerOptions<TFn>,
): SolidAsyncDebouncer<TFn> {
  const asyncDebouncer = new AsyncDebouncer<TFn>(fn, initialOptions)

  const [executionCount, setExecutionCount] = createSignal(
    asyncDebouncer.getExecutionCount(),
  )
  const [isPending, setIsPending] = createSignal(asyncDebouncer.getIsPending())

  function setOptions(newOptions: Partial<AsyncDebouncerOptions<TFn>>) {
    asyncDebouncer.setOptions({
      ...newOptions,
      onExecute: (asyncDebouncer) => {
        setExecutionCount(asyncDebouncer.getExecutionCount())
        setIsPending(asyncDebouncer.getIsPending())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(asyncDebouncer)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...bindInstanceMethods(asyncDebouncer),
    executionCount,
    isPending,
    setOptions,
  }
}
