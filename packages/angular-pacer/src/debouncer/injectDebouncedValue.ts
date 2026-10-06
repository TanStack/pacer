import { effect, linkedSignal, untracked } from '@angular/core'
import { injectDebouncer } from './injectDebouncer'
import type { AngularPacerOptions } from '../types'
import type { DebouncedSignal } from './injectDebouncedSignal'
import type { AngularDebouncerOptions } from './injectDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'

type Setter<T> = (value: T | ((previous: T) => T)) => void

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
 * The function returns a signal with named methods and a utility ref:
 * - A Signal that provides the current debounced value
 * - The debouncer instance with control methods
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
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
 * // Default selected state is an empty object
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
 *   console.log('Is pending:', debouncedWithPending.debouncer.state().isPending)
 * })
 *
 * // Control the debouncer
 * debounced.debouncer.cancel() // Cancel any pending updates
 * ```
 */
export function injectDebouncedValue<TValue, TSelected>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularDebouncerOptions<Setter<TValue>, TSelected>
  >,
  selector: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected>
export function injectDebouncedValue<TValue>(
  value: () => TValue,
  options: AngularPacerOptions<AngularDebouncerOptions<Setter<TValue>, {}>>,
  selector?: undefined,
): DebouncedSignal<TValue, {}>
export function injectDebouncedValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularDebouncerOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected | {}>
export function injectDebouncedValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularDebouncerOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected | {}> {
  // Initialize from the source once, lazily, after required inputs can be bound.
  const currentValue = linkedSignal<TValue, TValue>({
    source: value,
    computation: (initial, previous) => (previous ? previous.value : initial),
  })
  const debouncer = injectDebouncer(
    (next: TValue | ((previous: TValue) => TValue)) => {
      if (typeof next === 'function')
        currentValue.update(next as (previous: TValue) => TValue)
      else currentValue.set(next)
    },
    options,
    selector,
  )

  effect(() => {
    const latest = value()
    untracked(() => debouncer.maybeExecute(() => latest))
  })

  return Object.assign(currentValue.asReadonly(), {
    set: (next: TValue | ((previous: TValue) => TValue)) =>
      debouncer.maybeExecute(next),
    debouncer,
  })
}
