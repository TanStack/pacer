import { useAsyncQueuer } from './useAsyncQueuer'
import type { VueAsyncQueuer, VueAsyncQueuerOptions } from './useAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { VuePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function useAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => Promise<any>,
  options: VuePacerOptions<VueAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  VueAsyncQueuer<TValue, TSelected>['addItem'],
  VueAsyncQueuer<TValue, TSelected>,
] {
  const utility = useAsyncQueuer(fn, options, selector)
  return [() => utility.state.value.items, utility.addItem, utility]
}
