import { effect, Signal } from '@angular/core'
import { createDebouncedSignal } from './createDebouncedSignal'
import type { AngularDebouncer } from './createDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

type Setter<T> = (value: T | ((prev: T) => T)) => void

/**
 * An Angular function that creates a debounced value that updates only after a specified delay.
 * Unlike createDebouncedSignal, this function automatically tracks changes to the input signal
 * and updates the debounced value accordingly.
 *
 * The debounced value will only update after the specified wait time has elapsed since
 * the last change to the input value. If the input value changes again before the wait
 * time expires, the timer resets and starts waiting again.
 *
 * This is useful for deriving debounced values from signals that change frequently,
 * like search queries or form inputs, where you want to limit how often downstream effects
 * or calculations occur.
 *
 * The function returns a tuple containing:
 * - A Signal that provides the current debounced value
 * - The debouncer instance with control methods
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes. Only when you provide a selector will
 * the reactive system track the selected state values.
 *
 * Available debouncer state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const searchQuery = signal('');
 * const [debouncedQuery, debouncer] = createDebouncedValue(searchQuery, {
 *   wait: 500 // Wait 500ms after last change
 * });
 *
 * // Opt-in to reactive updates when pending state changes (optimized for loading indicators)
 * const [debouncedQuery, debouncer] = createDebouncedValue(
 *   searchQuery,
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // debouncedQuery will update 500ms after searchQuery stops changing
 * effect(() => {
 *   fetchSearchResults(debouncedQuery());
 * });
 *
 * // Access debouncer state via signals
 * console.log('Is pending:', debouncer.state().isPending);
 *
 * // Control the debouncer
 * debouncer.cancel(); // Cancel any pending updates
 * ```
 */
export function createDebouncedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialOptions: DebouncerOptions<Setter<TValue>>,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): [Signal<TValue>, AngularDebouncer<Setter<TValue>, TSelected>] {
  const [debouncedValue, setDebouncedValue, debouncer] = createDebouncedSignal(
    value(),
    initialOptions,
    selector,
  )

  effect(() => {
    setDebouncedValue(value())
  })

  return [debouncedValue, debouncer]
}

