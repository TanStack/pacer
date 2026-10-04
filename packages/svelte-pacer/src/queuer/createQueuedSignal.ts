import { createQueuer } from './createQueuer'
import type { SvelteQueuer, SvelteQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { SveltePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createQueuedSignal<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => void,
  options: SveltePacerOptions<SvelteQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  SvelteQueuer<TValue, TSelected>['addItem'],
  SvelteQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
