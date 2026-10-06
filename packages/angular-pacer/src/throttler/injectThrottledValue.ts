import { effect, linkedSignal, untracked } from '@angular/core'
import { injectThrottler } from './injectThrottler'
import type { AngularPacerOptions } from '../types'
import type { ThrottledSignal } from './injectThrottledSignal'
import type { AngularThrottlerOptions } from './injectThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'

type Setter<T> = (value: T | ((previous: T) => T)) => void

/**
 * An Angular function that creates a throttled value that updates at most once within a specified time window.
 * Unlike injectThrottledSignal, this function automatically tracks changes to the input signal
 * and updates the throttled value accordingly.
 *
 * The throttled value will update at most once within the specified wait time, regardless of
 * how frequently the input value changes.
 *
 * This is useful for deriving throttled values from signals that change frequently,
 * like scroll positions or mouse coordinates, where you want to limit how often downstream effects
 * or calculations occur.
 *
 * The function returns a throttled signal object containing:
 * - A Signal that provides the current throttled value
 * - The throttler instance with control methods
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for reactive state management via the underlying throttler instance.
 * The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
 *
 * Available throttler state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last execution
 * - `nextExecutionTime`: Timestamp of the next allowed execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const scrollY = signal(0)
 * const throttledScrollY = injectThrottledValue(scrollY, {
 *   wait: 100, // Update at most once per 100ms
 * })
 *
 * // Opt-in to reactive updates when pending state changes
 * const throttledScrollYWithState = injectThrottledValue(
 *   scrollY,
 *   { wait: 100 },
 *   (state) => ({ isPending: state.isPending }),
 * )
 *
 * // Read the throttled signal value
 * effect(() => {
 *   updateUI(throttledScrollY())
 * })
 *
 * // Access throttler state via the returned object's state() signal
 * console.log('Is pending:', throttledScrollYWithState.throttler.state().isPending)
 *
 * // Control the throttler
 * throttledScrollY.throttler.cancel() // Cancel any pending updates
 * ```
 */
export function injectThrottledValue<TValue, TSelected>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularThrottlerOptions<Setter<TValue>, TSelected>
  >,
  selector: (state: ThrottlerState<Setter<TValue>>) => TSelected,
): ThrottledSignal<TValue, TSelected>
export function injectThrottledValue<TValue>(
  value: () => TValue,
  options: AngularPacerOptions<AngularThrottlerOptions<Setter<TValue>, {}>>,
  selector?: undefined,
): ThrottledSignal<TValue, {}>
export function injectThrottledValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularThrottlerOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: ThrottlerState<Setter<TValue>>) => TSelected,
): ThrottledSignal<TValue, TSelected | {}>
export function injectThrottledValue<TValue, TSelected = {}>(
  value: () => TValue,
  options: AngularPacerOptions<
    AngularThrottlerOptions<Setter<TValue>, TSelected | {}>
  >,
  selector?: (state: ThrottlerState<Setter<TValue>>) => TSelected,
): ThrottledSignal<TValue, TSelected | {}> {
  // Initialize from the source once, lazily, after required inputs can be bound.
  const currentValue = linkedSignal<TValue, TValue>({
    source: value,
    computation: (initial, previous) => (previous ? previous.value : initial),
  })
  const throttler = injectThrottler(
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
    untracked(() => throttler.maybeExecute(() => latest))
  })

  return Object.assign(currentValue.asReadonly(), {
    set: (next: TValue | ((previous: TValue) => TValue)) =>
      throttler.maybeExecute(next),
    throttler,
  })
}
