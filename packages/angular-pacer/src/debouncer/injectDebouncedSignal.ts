import { signal } from '@angular/core'
import { injectDebouncer } from './injectDebouncer'
import type { AngularDebouncer } from './injectDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

type Setter<T> = (value: T | ((prev: T) => T)) => void

export type DebouncedSignal<TValue, TSelected = {}> = ((
  ...args: []
) => TValue) & {
  /**
   * Set or update the debounced value. This calls `debouncer.maybeExecute(...)`.
   */
  readonly set: Setter<TValue>
  /**
   * The debouncer instance with additional control methods and state signals.
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
 * The function returns a callable object:
 * - `debounced()`: Get the current debounced value
 * - `debounced.set(...)`: Set or update the debounced value (debounced via maybeExecute)
 * - `debounced.debouncer`: The debouncer instance with additional control methods and state signals
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
 * const debouncedQuery = injectDebouncedSignal('', { wait: 500 })
 *
 * // Get value
 * console.log(debouncedQuery())
 *
 * // Set/update value (debounced)
 * debouncedQuery.set('hello')
 *
 * // Access debouncer
 * console.log(debouncedQuery.debouncer.state().isPending)
 * ```
 */
export function injectDebouncedSignal<TValue, TSelected = {}>(
  value: TValue,
  initialOptions: DebouncerOptions<Setter<TValue>>,
  selector?: (state: DebouncerState<Setter<TValue>>) => TSelected,
): DebouncedSignal<TValue, TSelected> {
  const debouncedValue = signal<TValue>(value)

  const debouncer = injectDebouncer(
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

  const set: Setter<TValue> = (
    newValue: TValue | ((prev: TValue) => TValue),
  ) => {
    debouncer.maybeExecute(newValue)
  }

  const debounced = Object.assign(() => debouncedValue(), {
    set,
    debouncer,
  }) as DebouncedSignal<TValue, TSelected>

  return debounced
}
