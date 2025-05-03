import { useState } from 'react'
import { useDebouncer } from './useDebouncer'
import type { Debouncer, DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * A React hook that creates a debounced state value, combining React's useState with debouncing functionality.
 * This hook provides both the current debounced value and methods to update it.
 *
 * The state value is only updated after the specified wait time has elapsed since the last update attempt.
 * If another update is attempted before the wait time expires, the timer resets and starts waiting again.
 * This is useful for handling frequent state updates that should be throttled, like search input values
 * or window resize dimensions.
 *
 * The hook returns a tuple containing:
 * - The current debounced value
 * - A function to update the debounced value
 * - The debouncer instance with additional control methods
 *
 * @example
 * ```tsx
 * // Debounced search input
 * const [searchTerm, setSearchTerm, debouncer] = useDebouncedState('', {
 *   wait: 500 // Wait 500ms after last keystroke
 * });
 *
 * // Update value - will be debounced
 * const handleChange = (e) => {
 *   setSearchTerm(e.target.value);
 * };
 *
 * // Get number of times the debounced function has executed
 * const executionCount = debouncer.getExecutionCount();
 *
 * // Get the pending state
 * const isPending = debouncer.getIsPending();
 * ```
 */
export function useDebouncedState<TValue>(
  value: TValue,
  options: DebouncerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
): [
  TValue,
  React.Dispatch<React.SetStateAction<TValue>>,
  Debouncer<React.Dispatch<React.SetStateAction<TValue>>>,
] {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)
  const debouncer = useDebouncer(setDebouncedValue, options)
  return [debouncedValue, debouncer.maybeExecute, debouncer]
}
