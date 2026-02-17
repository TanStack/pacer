import { injectStore } from '@tanstack/angular-store'
import { Queuer } from '@tanstack/pacer/queuer'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface AngularQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'store'
> {
  /**
   * Reactive state signal that will be updated when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<QueuerState<TValue>>>
}

/**
 * An Angular function that creates and manages a Queuer instance.
 *
 * This is a lower-level function that provides direct access to the Queuer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The Queuer processes items synchronously in order, with optional delays between processing each item.
 * The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.
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
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const queue = injectQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 }
 * );
 *
 * // Opt-in to track queue contents changes
 * const queue = injectQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({ items: state.items, size: state.size })
 * );
 *
 * // Add items
 * queue.addItem('task1');
 *
 * // Access the selected state
 * const { items, isRunning } = queue.state();
 * ```
 */
export function injectQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): AngularQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().queuer,
    ...options,
  } as QueuerOptions<TValue>

  const queuer = new Queuer<TValue>(fn, mergedOptions)
  const state = injectStore(queuer.store, selector)

  return {
    ...queuer,
    state,
  } as AngularQueuer<TValue, TSelected>
}
