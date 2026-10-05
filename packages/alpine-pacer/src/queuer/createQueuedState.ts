import { createQueuer } from './createQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineQueuer, AlpineQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { AlpinePacerOptions } from '../types'
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
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedState } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const [items, addItem, queue] = createQueuedState(scope, (item: number) => { console.log(item) }, { wait: 500 })
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
  scope: PacerScope,
  fn: (item: TValue) => void,
  options: AlpinePacerOptions<AlpineQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  AlpineQueuer<TValue, TSelected>['addItem'],
  AlpineQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(scope, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
