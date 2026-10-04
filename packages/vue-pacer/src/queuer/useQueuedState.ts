import { useQueuer } from './useQueuer'
import type { VueQueuer, VueQueuerOptions } from './useQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { VuePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function useQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => void,
  options: VuePacerOptions<VueQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  VueQueuer<TValue, TSelected>['addItem'],
  VueQueuer<TValue, TSelected>,
] {
  const utility = useQueuer(fn, options, selector)
  return [() => utility.state.value.items, utility.addItem, utility]
}
