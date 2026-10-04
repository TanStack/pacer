import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncQueuer } from './useAsyncQueuer'
import type {
  OctaneAsyncQueuer,
  OctaneAsyncQueuerOptions,
} from './useAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { OctanePacerOptions } from '../types'
/** Returns pending queue items and their utility. Items are selected by default. */
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
