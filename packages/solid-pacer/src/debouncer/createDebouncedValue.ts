import { createEffect } from 'solid-js'
import { createDebouncedSignal } from './createDebouncedSignal'
import type { Accessor, Setter } from 'solid-js'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * A Solid hook that creates a debounced value that updates only after a specified delay.
 * Unlike createDebouncedSignal, this hook automatically tracks changes to the input value
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
 * The hook returns an Accessor that provides the current debounced value.
 *
 * @example
 * ```tsx
 * // Debounce a search query
 * const [searchQuery, setSearchQuery] = createSignal('');
 * const debouncedQuery = createDebouncedValue(searchQuery, {
 *   wait: 500 // Wait 500ms after last change
 * });
 *
 * // debouncedQuery will update 500ms after searchQuery stops changing
 * createEffect(() => {
 *   fetchSearchResults(debouncedQuery());
 * });
 *
 * // Handle input changes
 * const handleChange = (e) => {
 *   setSearchQuery(e.target.value);
 * };
 * ```
 */
export function createDebouncedValue<TValue>(
  value: Accessor<TValue>,
  initialOptions: DebouncerOptions<Setter<TValue>>,
): Accessor<TValue> {
  const [debouncedValue, setDebouncedValue] = createDebouncedSignal(
    value(),
    initialOptions,
  )

  createEffect(() => {
    setDebouncedValue(value() as any)
  })

  return debouncedValue
}
