import { createQueuer } from './createQueuer'
import type { ReactiveControllerHost } from 'lit'
import type { LitQueuer, LitQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { LitPacerOptions } from '../types'
/**
 * Exposes pending queue items together with the queue that processes them.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [itemsAccessor, addItem, queue]. Call itemsAccessor() to read pending items.
 *
 * ## State and ownership
 *
 * Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedState } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const [items, addItem, queue] = createQueuedState(this, (item: number) => { console.log(item) }, { wait: 500 })
 * addItem(1)
 * console.log(items())
 * ```
 *
 * @see createQueuer
 */
export function createQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  host: ReactiveControllerHost,
  fn: (item: TValue) => void,
  options: LitPacerOptions<LitQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  LitQueuer<TValue, TSelected>['addItem'],
  LitQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(host, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
