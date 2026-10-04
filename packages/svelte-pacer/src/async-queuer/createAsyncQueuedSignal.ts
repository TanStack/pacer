import { createAsyncQueuer } from './createAsyncQueuer'
import type {
  SvelteAsyncQueuer,
  SvelteAsyncQueuerOptions,
} from './createAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { SveltePacerOptions } from '../types'
/**
 * Exposes pending queue items together with the queue that processes them.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [itemsAccessor, queue]. Call itemsAccessor() to read pending items. Call queue.addItem() to enqueue; there is no separate setter tuple entry.
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
 * import { createAsyncQueuedSignal } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const [items, queue] = createAsyncQueuedSignal(async (item: number) => { console.log(item) }, { wait: 500 })
 * queue.addItem(1)
 * console.log(items())
 * ```
 *
 * @see createAsyncQueuer
 */
export function createAsyncQueuedSignal<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => Promise<any>,
  options: SveltePacerOptions<SvelteAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [() => Array<TValue>, SvelteAsyncQueuer<TValue, TSelected>] {
  const utility = createAsyncQueuer(fn, options, selector)
  return [() => utility.state.items, utility]
}
