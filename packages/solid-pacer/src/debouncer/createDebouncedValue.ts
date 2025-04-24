import { createEffect, onCleanup } from 'solid-js'
import { createDebouncedSignal } from './createDebouncedSignal'
import type { SolidDebouncer } from './createDebouncer'
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
 * The hook returns a tuple containing:
 * - The current debounced value (as an Accessor)
 * - The debouncer instance with control methods and state signals
 *
 * @example
 * ```tsx
 * // Debounce a search query
 * const [searchQuery, setSearchQuery] = createSignal('');
 * const [debouncedQuery, debouncer] = createDebouncedValue(searchQuery, {
 *   wait: 500 // Wait 500ms after last change
 * });
 *
 * // debouncedQuery will update 500ms after searchQuery stops changing
 * createEffect(() => {
 *   fetchSearchResults(debouncedQuery());
 * });
 *
 * // Access debouncer state via signals
 * console.log('Executions:', debouncer.executionCount());
 * console.log('Is pending:', debouncer.isPending());
 *
 * // Handle input changes
 * const handleChange = (e) => {
 *   setSearchQuery(e.target.value);
 * };
 * ```
 */
export function createDebouncedValue<TValue>(
  value: Accessor<TValue>,
  initialOptions: DebouncerOptions<Setter<TValue>, [Accessor<TValue>]>,
): [Accessor<TValue>, SolidDebouncer<Setter<TValue>, [Accessor<TValue>]>] {
  const [debouncedValue, setDebouncedValue, debouncer] = createDebouncedSignal(
    value(),
    initialOptions,
  )

  createEffect(() => {
    setDebouncedValue(value() as any)
    onCleanup(() => {
      debouncer.cancel()
    })
  })

  return [debouncedValue, debouncer]
}
