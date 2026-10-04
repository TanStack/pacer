import { splitSlot, subSlot } from '../utils/slots'
import { useQueuer } from './useQueuer'
import type { OctaneQueuer, OctaneQueuerOptions } from './useQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { OctanePacerOptions } from '../types'
/** Returns pending queue items and their utility. Items are selected by default. */
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
): [Array<TValue>, OctaneQueuer<TValue, TSelected>]
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
): [Array<TValue>, OctaneQueuer<TValue, TSelected>] {
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
  return [utility.state.items, utility]
}
