import { Debouncer } from '@tanstack/pacer/debouncer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '../utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

export interface SolidDebouncer<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
> extends Debouncer<TFn, TArgs> {
  executionCount: Accessor<number>
  isPending: Accessor<boolean>
}

/**
 * A Solid hook that creates and manages a Debouncer instance.
 *
 * This is a lower-level hook that provides direct access to the Debouncer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (createSignal, Redux, Zustand, etc.).
 *
 * This hook provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
 *
 * @example
 * ```tsx
 * // Debounce a search function to limit API calls
 * const { maybeExecute, executionCount, isPending } = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 } // Wait 500ms after last keystroke
 * );
 *
 * // In an event handler
 * const handleChange = (e) => {
 *   maybeExecute(e.target.value);
 * };
 *
 * // Get number of times the debounced function has executed
 * console.log('Executions:', executionCount());
 * console.log('Is pending:', isPending());
 * ```
 */

export function createDebouncer<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions<TFn, TArgs>) {
  const debouncer = new Debouncer<TFn, TArgs>(fn, options)

  const [executionCount, setExecutionCount] = createSignal(
    debouncer.getExecutionCount(),
  )
  const [isPending, setIsPending] = createSignal(debouncer.getIsPending())

  debouncer.setOptions({
    ...options,
    onExecute: (debouncer) => {
      setExecutionCount(debouncer.getExecutionCount())
      setIsPending(debouncer.getIsPending())
      options.onExecute?.(debouncer)
    },
  })

  return {
    ...bindInstanceMethods(debouncer),
    executionCount,
    isPending,
  } as unknown as SolidDebouncer<TFn, TArgs>
}
