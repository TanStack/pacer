import { useRef } from 'react'
import { Debouncer } from '@tanstack/pacer/debouncer'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * A React hook that creates and manages a Debouncer instance.
 *
 * This is a lower-level hook that provides direct access to the Debouncer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.).
 *
 * This hook provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
 *
 * @template TFn The type of function to be debounced
 * @template TArgs The type of arguments the function accepts
 * @param fn The function to debounce
 * @param options Configuration options including wait time and maxWait
 * @returns An object containing debouncer control methods
 *
 * @example
 * ```tsx
 * // Debounce a search function to limit API calls
 * const searchDebouncer = useDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 } // Wait 500ms after last keystroke
 * );
 *
 * // In an event handler
 * const handleChange = (e) => {
 *   searchDebouncer.maybeExecute(e.target.value);
 * };
 *
 * // Get number of times the debounced function has executed
 * const executionCount = searchDebouncer.getExecutionCount();
 * ```
 */
export function useDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncer = useRef<Debouncer<TFn, TArgs>>(null)

  if (!debouncer.current) {
    debouncer.current = new Debouncer(fn, options)
  }

  return {
    maybeExecute: debouncer.current.maybeExecute.bind(debouncer.current),
    cancel: debouncer.current.cancel.bind(debouncer.current),
    getExecutionCount: debouncer.current.getExecutionCount.bind(
      debouncer.current,
    ),
  } as const
}
