import { createQueuer } from './createQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineQueuer, AlpineQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { AlpinePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
>(
  scope: PacerScope,
  fn: (item: TValue) => void,
  options: AlpinePacerOptions<AlpineQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  AlpineQueuer<TValue, TSelected>['addItem'],
  AlpineQueuer<TValue, TSelected>,
] {
  const utility = createQueuer(scope, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
