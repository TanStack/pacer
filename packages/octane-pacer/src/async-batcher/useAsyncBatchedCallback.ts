import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncBatcher } from './useAsyncBatcher'
import type {
  OctaneAsyncBatcher,
  OctaneAsyncBatcherOptions,
} from './useAsyncBatcher'
import type { OctanePacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Octane lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. The returned Promise preserves the core result and error contract. An addition that only schedules a batch does not await the later batch result.
 *
 * ## State and ownership
 *
 * Use useAsyncBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncBatchedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useAsyncBatchedCallback(async (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncBatcher
 */
export function useAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: OctanePacerOptions<OctaneAsyncBatcherOptions<TValue>>,
): OctaneAsyncBatcher<TValue>['addItem']
export function useAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncBatcherOptions<TValue>>,
    slot?: symbol,
  ]
): OctaneAsyncBatcher<TValue>['addItem'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncBatcher<TValue> as (
    ...args: [...Parameters<typeof useAsyncBatcher<TValue>>, symbol]
  ) => OctaneAsyncBatcher<TValue>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncBatcherOptions<TValue>>,
    undefined,
    subSlot(slot, 'utility'),
  ).addItem
}
