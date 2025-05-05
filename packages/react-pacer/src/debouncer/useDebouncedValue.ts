import { useEffect } from 'react'
import { useDebouncedState } from './useDebouncedState'
import type { Debouncer, DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * A React hook that creates a debounced value that updates only after a specified delay.
 * Unlike useDebouncedState, this hook automatically tracks changes to the input value
 * and updates the debounced value accordingly.
 *
 * The debounced value will only update after the specified wait time has elapsed since
 * the last change to the input value. If the input value changes again before the wait
 * time expires, the timer resets and starts waiting again.
 *
 * This is useful for deriving debounced values from props or state that change frequently,
 * like search queries or form inputs, where you want to limit how often downstream effects
 * or calculations occur.
 *
 * The hook returns the current debounced value and the underlying debouncer instance.
 * The debouncer instance can be used to access additional functionality like cancellation
 * and execution counts.
 *
 * @example
 * ```tsx
 * // Debounce a search query
 * const [searchQuery, setSearchQuery] = useState('');
 * const [debouncedQuery, debouncer] = useDebouncedValue(searchQuery, {
 *   wait: 500 // Wait 500ms after last change
 * });
 *
 * // debouncedQuery will update 500ms after searchQuery stops changing
 * useEffect(() => {
 *   fetchSearchResults(debouncedQuery);
 * }, [debouncedQuery]);
 *
 * // Handle input changes
 * const handleChange = (e) => {
 *   setSearchQuery(e.target.value);
 * };
 * ```
 */
export function useDebouncedValue<TValue>(
  value: TValue,
  options: DebouncerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
): [TValue, Debouncer<React.Dispatch<React.SetStateAction<TValue>>>] {
  const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedState(
    value,
    options,
  )

  useEffect(() => {
    setDebouncedValue(value)
  }, [value, setDebouncedValue])

  return [debouncedValue, debouncer]
}
