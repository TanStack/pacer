import { signal } from '@angular/core'
import { createDebouncer } from './createDebouncer'
import type { Signal } from '@angular/core'
import type { AngularDebouncer } from './createDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

type Setter<T> = (value: T | ((prev: T) => T)) => void

export interface DebouncedSignal<TValue, TSelected = {}> {
  /**
   * The current debounced value signal
   */
  readonly value: Signal<TValue>
  /**
   * Function to update the debounced value
   */
  readonly setValue: Setter<TValue>
  /**
   * The debouncer instance with additional control methods and state signals
   */
  readonly debouncer: AngularDebouncer<Setter<TValue>, TSelected>
}

/**
 * An Angular function that creates a debounced state signal, combining Angular's signal with debouncing functionality.
 * This function provides both the current debounced value and methods to update it.
 *
 * The state value is only updated after the specified wait time has elapsed since the last update attempt.
 * If another update is attempted before the wait time expires, the timer resets and starts waiting again.
 * This is useful for handling frequent state updates that should be throttled, like search input values
 * or window resize dimensions.
 *
 * The function returns an object containing:
 * - `value`: The current debounced value signal
 * - `setValue`: A function to update the debounced value
 * - `debouncer`: The debouncer instance with additional control methods and state signals
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
 * const debounced = createDebouncedSignal('', {
 *   wait: 500 // Wait 500ms after last keystroke
 * });
 *
 * // Opt-in to reactive updates when pending state changes (optimized for loading indicators)
 * const debounced = createDebouncedSignal(
 *   '',
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // Update value - will be debounced
 * const handleChange = (e: Event) => {
 *   const target = e.target as HTMLInputElement
 *   debounced.setValue(target.value);
 * };
 *
 * // Access debounced value
 * console.log('Search term:', debounced.value());
 *
 * // Access debouncer state via signals
 * console.log('Executions:', debounced.debouncer.state().executionCount);
 * console.log('Is pending:', debounced.debouncer.state().isPending);
 * ```
 */
export function createDebouncedSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: DebouncerOptions<Setter<TValue>>,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected> {
  const debouncedValue = signal<TValue>(value)

  const debouncer = createDebouncer(
    (newValue: TValue | ((prev: TValue) => TValue)) => {
      if (typeof newValue === 'function') {
        debouncedValue.update(newValue as (prev: TValue) => TValue)
      } else {
        debouncedValue.set(newValue)
      }
    },
    initialOptions,
    selector,
  )

  const setValue: Setter<TValue> = (
    newValue: TValue | ((prev: TValue) => TValue),
  ) => {
    debouncer.maybeExecute(newValue)
  }

  return {
    value: debouncedValue.asReadonly(),
    setValue,
    debouncer,
  }
}
