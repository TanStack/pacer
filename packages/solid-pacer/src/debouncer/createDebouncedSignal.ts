import { createSignal } from 'solid-js'
import { createDebouncer } from './createDebouncer'
import type { Accessor, Setter } from 'solid-js'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * A Solid hook that creates a debounced state value, combining Solid's createSignal with debouncing functionality.
 * This hook provides both the current debounced value and methods to update it.
 *
 * The state value is only updated after the specified wait time has elapsed since the last update attempt.
 * If another update is attempted before the wait time expires, the timer resets and starts waiting again.
 * This is useful for handling frequent state updates that should be throttled, like search input values
 * or window resize dimensions.
 *
 * The hook returns a tuple containing:
 * - The current debounced value accessor
 * - A function to update the debounced value
 * - The debouncer instance with additional control methods
 *
 * @example
 * ```tsx
 * // Debounced search input
 * const [searchTerm, setSearchTerm, debouncer] = createDebouncedSignal('', {
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
 * ```
 */
export function createDebouncedSignal<TValue>(
  value: TValue,
  options: DebouncerOptions<Setter<TValue>, [Accessor<TValue>]>,
) {
  const [debouncedValue, setDebouncedValue] = createSignal<TValue>(value)

  const debouncer = createDebouncer(setDebouncedValue, options)

  return [
    debouncedValue,
    debouncer.maybeExecute as Setter<TValue>,
    debouncer,
  ] as const
}
