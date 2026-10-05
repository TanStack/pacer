import { createAsyncQueuer } from './createAsyncQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncQueuer,
  AlpineAsyncQueuerOptions,
} from './createAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { AlpinePacerOptions } from '../types'
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
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createAsyncQueuedState } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const [items, queue] = createAsyncQueuedState(scope, async (item: number) => { console.log(item) }, { wait: 500 })
 * queue.addItem(1)
 * console.log(items())
 * ```
 *
 * @see createAsyncQueuer
 */
export function createAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  scope: PacerScope,
  fn: (item: TValue) => Promise<any>,
  options: AlpinePacerOptions<AlpineAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [() => Array<TValue>, AlpineAsyncQueuer<TValue, TSelected>] {
  const utility = createAsyncQueuer(scope, fn, options, selector)
  return [() => utility.state.items, utility]
}
