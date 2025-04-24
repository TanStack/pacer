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
 * The hook returns a tuple containing:
 * - The current debounced value
 * - The debouncer instance with control methods
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
  options: DebouncerOptions<
    React.Dispatch<React.SetStateAction<TValue>>,
    [value: React.SetStateAction<TValue>]
  >,
): [TValue, Debouncer<React.Dispatch<React.SetStateAction<TValue>>, [TValue]>] {
  const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedState(
    value,
    options,
  )

  useEffect(() => {
    setDebouncedValue(value)
    return () => {
      debouncer.cancel()
    }
  }, [value, setDebouncedValue, debouncer])

  return [debouncedValue, debouncer]
}
