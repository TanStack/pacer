import { effect, linkedSignal } from '@angular/core'
import { injectThrottledSignal } from './injectThrottledSignal'
import type { ThrottledSignal } from './injectThrottledSignal'
import type { Signal } from '@angular/core'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

type Setter<T> = (value: T | ((prev: T) => T)) => void

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
 * The function returns a tuple containing:
 * - A Signal that provides the current throttled value
 * - The throttler instance with control methods
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for reactive state management via the underlying throttler instance.
 * The `selector` parameter allows you to specify which throttler state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * Available throttler state properties:
 * - `canLeadingExecute`: Whether the throttler can execute on the leading edge
 * - `canTrailingExecute`: Whether the throttler can execute on the trailing edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last execution
 * - `nextExecutionTime`: Timestamp of the next allowed execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const scrollY = signal(0);
 * const [throttledScrollY, throttler] = injectThrottledValue(scrollY, {
 *   wait: 100 // Update at most once per 100ms
 * });
 *
 * // Opt-in to reactive updates when pending state changes
 * const [throttledScrollY, throttler] = injectThrottledValue(
 *   scrollY,
 *   { wait: 100 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // throttledScrollY will update at most once per 100ms
 * effect(() => {
 *   updateUI(throttledScrollY());
 * });
 *
 * // Access throttler state via signals
 * console.log('Is pending:', throttler.state().isPending);
 *
 * // Control the throttler
 * throttler.cancel(); // Cancel any pending updates
 * ```
 */
export function injectThrottledValue<TValue, TSelected = {}>(
  value: Signal<TValue>,
  initialOptions: ThrottlerOptions<Setter<TValue>>,
  selector?: (state: ThrottlerState<Setter<TValue>>) => TSelected,
): ThrottledSignal<TValue, TSelected> {
  const linkedValue = linkedSignal(() => value())
  const throttledValue = injectThrottledSignal(
    linkedValue(),
    initialOptions,
    selector,
  )

  effect(() => {
    throttledValue.set(linkedValue())
  })

  return throttledValue
}
