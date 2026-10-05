import { splitSlot, subSlot } from '../utils/slots'
import { useBatcher } from './useBatcher'
import type { OctaneBatcher, OctaneBatcherOptions } from './useBatcher'
import type { OctanePacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Octane lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use useBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useBatchedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useBatchedCallback((items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * schedule(1)
 * ```
 *
 * @see useBatcher
 */
export function useBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  options: OctanePacerOptions<OctaneBatcherOptions<TValue>>,
): OctaneBatcher<TValue>['addItem']
export function useBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  ...rest: [
    options: OctanePacerOptions<OctaneBatcherOptions<TValue>>,
    slot?: symbol,
  ]
): OctaneBatcher<TValue>['addItem'] {
  const [args, slot] = splitSlot(rest)
  const hook = useBatcher<TValue> as (
    ...args: [...Parameters<typeof useBatcher<TValue>>, symbol]
  ) => OctaneBatcher<TValue>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneBatcherOptions<TValue>>,
    undefined,
    subSlot(slot, 'utility'),
  ).addItem
}
