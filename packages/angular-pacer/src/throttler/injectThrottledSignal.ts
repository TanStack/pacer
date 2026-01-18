import { signal } from '@angular/core'
import { injectThrottler } from './injectThrottler'
import type { Signal } from '@angular/core'
import type { AngularThrottler } from './injectThrottler'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

type Setter<T> = (value: T | ((prev: T) => T)) => void

/**
 * An Angular function that creates a throttled state signal, combining Angular's signal with throttling functionality.
 * This function provides both the current throttled value and methods to update it.
 *
 * The state value is updated at most once within the specified wait time.
 * This is useful for handling frequent state updates that should be rate-limited, like scroll positions
 * or mouse movements.
 *
 * The function returns a tuple containing:
 * - The current throttled value signal
 * - A function to update the throttled value
 * - The throttler instance with additional control methods and state signals
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
 * const [scrollY, setScrollY, throttler] = injectThrottledSignal(0, {
 *   wait: 100 // Update at most once per 100ms
 * });
 *
 * // Opt-in to reactive updates when pending state changes
 * const [scrollY, setScrollY, throttler] = injectThrottledSignal(
 *   0,
 *   { wait: 100 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // Update value - will be throttled
 * window.addEventListener('scroll', () => {
 *   setScrollY(window.scrollY);
 * });
 * ```
 */
export function injectThrottledSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: ThrottlerOptions<Setter<TValue>>,
  selector?: (state: ThrottlerState<Setter<TValue>>) => TSelected,
): [
  Signal<TValue>,
  Setter<TValue>,
  AngularThrottler<Setter<TValue>, TSelected>,
] {
  const throttledValue = signal<TValue>(value)

  const throttler = injectThrottler(
    (newValue: TValue | ((prev: TValue) => TValue)) => {
      if (typeof newValue === 'function') {
        throttledValue.update(newValue as (prev: TValue) => TValue)
      } else {
        throttledValue.set(newValue)
      }
    },
    initialOptions,
    selector,
  )

  const setter: Setter<TValue> = (
    newValue: TValue | ((prev: TValue) => TValue),
  ) => {
    throttler.maybeExecute(newValue)
  }

  return [throttledValue.asReadonly(), setter, throttler]
}
