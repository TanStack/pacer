import { useState } from 'react'
import { useDebouncer } from './useDebouncer'
import type { ReactDebouncer } from './useDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

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
 * const isPending = debouncer.getState().isPending;
 * ```
 */
export function useDebouncedState<
  TValue,
  TSelected = DebouncerState<React.Dispatch<React.SetStateAction<TValue>>>,
>(
  value: TValue,
  options: DebouncerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
  selector?: (
    state: DebouncerState<React.Dispatch<React.SetStateAction<TValue>>>,
  ) => TSelected,
): [
  TValue,
  React.Dispatch<React.SetStateAction<TValue>>,
  ReactDebouncer<React.Dispatch<React.SetStateAction<TValue>>, TSelected>,
] {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const debouncer = useDebouncer(setDebouncedValue, options, selector)
  return [debouncedValue, debouncer.maybeExecute, debouncer]
}
