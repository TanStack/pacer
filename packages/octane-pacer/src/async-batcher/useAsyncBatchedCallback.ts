import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncBatcher } from './useAsyncBatcher'
import type {
  OctaneAsyncBatcher,
  OctaneAsyncBatcherOptions,
} from './useAsyncBatcher'
import type { OctanePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as useAsyncBatcher.
 * Use the constructor instead when you also need selected state or control methods.
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
