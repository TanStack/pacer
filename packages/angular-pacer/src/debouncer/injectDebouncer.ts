import { injectStore } from '@tanstack/angular-store'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/store'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

export interface AngularDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<DebouncerState<TFn>>>
}

/**
 * An Angular function that creates and manages a Debouncer instance.
 *
 * This is a lower-level function that provides direct access to the Debouncer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
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
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const debouncer = injectDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isPending changes (optimized for loading states)
 * const debouncer = injectDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // In an event handler
 * const handleChange = (e: Event) => {
 *   const target = e.target as HTMLInputElement
 *   debouncer.maybeExecute(target.value);
 * };
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending } = debouncer.state();
 * ```
 */
export function injectDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: DebouncerOptions<TFn>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): AngularDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().debouncer,
    ...options,
  } as DebouncerOptions<TFn>

  const debouncer = new Debouncer<TFn>(fn, mergedOptions)
  const state = injectStore(debouncer.store, selector)

  return {
    ...debouncer,
    state,
  } as AngularDebouncer<TFn, TSelected>
}
