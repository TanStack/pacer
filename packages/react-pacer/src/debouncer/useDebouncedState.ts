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
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, all debouncer state changes will trigger a re-render.** To optimize performance, you can
 * provide a selector function that returns only the specific state values your component needs.
 * The component will only re-render when the selected values change.
 *
 * Available debouncer state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```tsx
 * // Debounced search input (re-renders on any debouncer state change)
 * const [searchTerm, setSearchTerm, debouncer] = useDebouncedState('', {
 *   wait: 500 // Wait 500ms after last keystroke
 * });
 *
 * // Only re-render when pending state changes (optimized for loading indicators)
 * const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
 *   '',
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // Only re-render when execution count changes (optimized for tracking executions)
 * const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
 *   '',
 *   { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Only re-render when debouncing status changes (optimized for status display)
 * const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
 *   '',
 *   { wait: 500 },
 *   (state) => ({
 *     status: state.status,
 *     canLeadingExecute: state.canLeadingExecute
 *   })
 * );
 *
 * // Update value - will be debounced
 * const handleChange = (e) => {
 *   setSearchTerm(e.target.value);
 * };
 *
 * // Access the selected debouncer state
 * const { isPending, executionCount } = debouncer.state;
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
