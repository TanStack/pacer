import { splitSlot, subSlot } from '../utils/slots'
import { useBatcher } from './useBatcher'
import type { OctaneBatcher, OctaneBatcherOptions } from './useBatcher'
import type { OctanePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as useBatcher.
 * Use the constructor instead when you also need selected state or control methods.
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
