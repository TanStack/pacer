import { createQueuer } from './createQueuer'
import type { ReactiveControllerHost } from 'lit'
import type { LitQueuer, LitQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { LitPacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  host: ReactiveControllerHost,
  fn: (item: TValue) => void,
  options: LitPacerOptions<LitQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  LitQueuer<TValue, TSelected>['addItem'],
  LitQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(host, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
