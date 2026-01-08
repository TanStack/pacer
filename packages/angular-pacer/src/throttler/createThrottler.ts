import { signal, Signal } from '@angular/core'
import { DestroyRef, inject } from '@angular/core'
import { Throttler } from '@tanstack/pacer/throttler'
import { useDefaultPacerOptions } from '../provider/pacer-context'
import type { Store } from '@tanstack/store'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

export interface AngularThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<ThrottlerState<TFn>>>
}

/**
 * An Angular function that creates and manages a Throttler instance.
 *
 * This is a lower-level function that provides direct access to the Throttler's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides throttling functionality to limit how often a function can be called,
 * ensuring it executes at most once within a specified time window.
 *
 * The throttler will execute the function immediately (if leading is enabled) and then
 * prevent further executions until the wait period has elapsed.
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for state management and wraps it with Angular signals.
 * The `selector` parameter allows you to specify which state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary updates when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * Available state properties:
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
 * const throttler = createThrottler(
 *   (scrollY: number) => updateScrollPosition(scrollY),
 *   { wait: 100 }
 * );
 *
 * // Opt-in to track isPending changes (optimized for loading states)
 * const throttler = createThrottler(
 *   (scrollY: number) => updateScrollPosition(scrollY),
 *   { wait: 100 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // In an event handler
 * window.addEventListener('scroll', () => {
 *   throttler.maybeExecute(window.scrollY);
 * });
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending } = throttler.state();
 * ```
 */
export function createThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): AngularThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().throttler,
    ...options,
  } as ThrottlerOptions<TFn>

  const throttler = new Throttler<TFn>(fn, mergedOptions)
  const stateSignal = signal<Readonly<TSelected>>(
    selector(throttler.store.state) as Readonly<TSelected>,
  )

  // Subscribe to store changes and update signal
  const unsubscribe = throttler.store.subscribe((state) => {
    const selected = selector(state)
    stateSignal.set(selected as Readonly<TSelected>)
  })

  const destroyRef = inject(DestroyRef, { optional: true })
  if (destroyRef) {
    destroyRef.onDestroy(() => {
      unsubscribe()
      throttler.cancel()
    })
  }

  return {
    ...throttler,
    state: stateSignal.asReadonly(),
  } as AngularThrottler<TFn, TSelected>
}

