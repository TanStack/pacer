import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncQueuer } from './useAsyncQueuer'
import type {
  OctaneAsyncQueuer,
  OctaneAsyncQueuerOptions,
} from './useAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { OctanePacerOptions } from '../types'
/**
 * Exposes pending queue items together with the queue that processes them.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [items, queue]. Call queue.addItem() to enqueue; there is no separate setter tuple entry.
 *
 * ## State and ownership
 *
 * Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncQueuedState } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const [items, queue] = useAsyncQueuedState(async (item: number) => { console.log(item) }, { wait: 500 })
 * queue.addItem(1)
 * // Read items during rendering.
 * ```
 *
 * @see useAsyncQueuer
 */
export function useAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (value: TValue) => Promise<any>,
  options?: OctanePacerOptions<OctaneAsyncQueuerOptions<TValue, TSelected>>,
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): [Array<TValue>, OctaneAsyncQueuer<TValue, TSelected>]
export function useAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (value: TValue) => Promise<any>,
  ...rest: [
    options?: OctanePacerOptions<OctaneAsyncQueuerOptions<TValue, TSelected>>,
    selector?: (state: AsyncQueuerState<TValue>) => TSelected,
    slot?: symbol,
  ]
): [Array<TValue>, OctaneAsyncQueuer<TValue, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncQueuer<TValue, TSelected> as (
    ...args: [...Parameters<typeof useAsyncQueuer<TValue, TSelected>>, symbol]
  ) => OctaneAsyncQueuer<TValue, TSelected>
  const selector = (args[1] ??
    ((state: AsyncQueuerState<TValue>) => ({ items: state.items }))) as (
    state: AsyncQueuerState<TValue>,
  ) => TSelected
  const utility = hook(
    fn,
    args[0] as
      | OctanePacerOptions<OctaneAsyncQueuerOptions<TValue, TSelected>>
      | undefined,
    selector,
    subSlot(slot, 'utility'),
  )
  return [utility.state.items, utility]
}
