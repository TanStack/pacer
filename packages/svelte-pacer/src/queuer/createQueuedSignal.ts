import { createQueuer } from './createQueuer'
import type { SvelteQueuer, SvelteQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { SveltePacerOptions } from '../types'
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
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedSignal } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const [items, addItem, queue] = createQueuedSignal((item: number) => { console.log(item) }, { wait: 500 })
 * addItem(1)
 * console.log(items())
 * ```
 *
 * @see createQueuer
 */
export function createQueuedSignal<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => void,
  options: SveltePacerOptions<SvelteQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  SvelteQueuer<TValue, TSelected>['addItem'],
  SvelteQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
