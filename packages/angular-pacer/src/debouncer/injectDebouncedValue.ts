import { effect } from '@angular/core'
import { injectDebouncedSignal } from './injectDebouncedSignal'
import type { DebouncedSignal } from './injectDebouncedSignal'
import type { Signal } from '@angular/core'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

type Setter<T> = (value: T | ((prev: T) => T)) => void

/**
 * An Angular function that creates a debounced value that updates only after a specified delay.
 * Unlike injectDebouncedSignal, this function automatically tracks changes to the input signal
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
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const searchQuery = signal('')
 * const debounced = injectDebouncedValue(searchQuery, {
 *   wait: 500, // Wait 500ms after last change
 * })
 *
 * // Opt-in to reactive updates when pending state changes (optimized for loading indicators)
 * const debouncedWithPending = injectDebouncedValue(
 *   searchQuery,
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending }),
 * )
 *
 * // Debounced value will update 500ms after searchQuery stops changing
 * effect(() => {
 *   fetchSearchResults(debounced())
 * })
 *
 * // Access selected debouncer state via signals (only if you provided a selector)
 * effect(() => {
 *   console.log('Is pending:', debouncedWithPending.state().isPending)
 * })
 *
 * // Control the debouncer
 * debounced.cancel() // Cancel any pending updates
 * ```
 */
export function injectDebouncedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialOptions: DebouncerOptions<Setter<TValue>>,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected>
export function injectDebouncedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialValue: TValue,
  initialOptions: DebouncerOptions<Setter<TValue>>,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected>
export function injectDebouncedValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialValueOrOptions: TValue | DebouncerOptions<Setter<TValue>>,
  initialOptionsOrSelector?:
    | DebouncerOptions<Setter<TValue>>
    | ((state: DebouncerState<Setter<TValue>>) => TSelected),
  maybeSelector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected> {
  const hasSelector = typeof initialOptionsOrSelector === 'function'

  const hasInitialValue =
    (initialOptionsOrSelector !== undefined && !hasSelector) ||
    maybeSelector !== undefined

  const initialValue = hasInitialValue
    ? (initialValueOrOptions as TValue)
    : (undefined as unknown as TValue)
  const initialOptions = hasInitialValue
    ? (initialOptionsOrSelector as DebouncerOptions<Setter<TValue>>)
    : (initialValueOrOptions as DebouncerOptions<Setter<TValue>>)
  const selector = hasInitialValue
    ? maybeSelector
    : (initialOptionsOrSelector as
        | ((state: DebouncerState<Setter<TValue>>) => TSelected)
        | undefined)

  const debounced = injectDebouncedSignal(
    initialValue,
    initialOptions,
    selector,
  )

  effect(() => {
    const latest = value()
    debounced.set(latest)
  })

  return debounced
}
