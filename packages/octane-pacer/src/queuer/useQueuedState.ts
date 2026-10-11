import { splitSlot, subSlot } from '../utils/slots'
import { useQueuer } from './useQueuer'
import type { OctaneQueuer, OctaneQueuerOptions } from './useQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { OctanePacerOptions } from '../types'
/**
 * Exposes pending queue items together with the queue that processes them.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [items, addItem, queue].
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
 * import { useQueuedState } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const [items, addItem, queue] = useQueuedState((item: number) => { console.log(item) }, { wait: 500 })
 * addItem(1)
 * // Read items during rendering.
 * ```
 *
 * @see useQueuer
 */
export function useQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (value: TValue) => void,
  options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): [
  Array<TValue>,
  OctaneQueuer<TValue, TSelected>['addItem'],
  OctaneQueuer<TValue, TSelected>,
]
export function useQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (value: TValue) => void,
  ...rest: [
    options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
    selector?: (state: QueuerState<TValue>) => TSelected,
    slot?: symbol,
  ]
): [
  Array<TValue>,
  OctaneQueuer<TValue, TSelected>['addItem'],
  OctaneQueuer<TValue, TSelected>,
] {
  const [args, slot] = splitSlot(rest)
  const hook = useQueuer<TValue, TSelected> as (
    ...args: [...Parameters<typeof useQueuer<TValue, TSelected>>, symbol]
  ) => OctaneQueuer<TValue, TSelected>
  const selector = (args[1] ??
    ((state: QueuerState<TValue>) => ({ items: state.items }))) as (
    state: QueuerState<TValue>,
  ) => TSelected
  const utility = hook(
    fn,
    args[0] as
      OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>> | undefined,
    selector,
    subSlot(slot, 'utility'),
  )
  return [utility.state.items, utility.addItem, utility]
}
