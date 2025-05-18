import { useEffect, useState } from 'react'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'

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
 *
 * // Get the pending state
 * const isPending = searchDebouncer.getIsPending();
 * ```
 */
export function useDebouncer<TFn extends AnyFunction>(
  fn: TFn,
  options: DebouncerOptions<TFn>,
): Debouncer<TFn> {
  const [debouncer] = useState(() =>
    bindInstanceMethods(new Debouncer<TFn>(fn, options)),
  )

  debouncer.setOptions(options)

  useEffect(() => {
    return () => {
      debouncer.cancel()
    }
  }, [debouncer])

  return debouncer
}
