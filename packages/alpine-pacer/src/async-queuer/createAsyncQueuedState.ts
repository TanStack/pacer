import { createAsyncQueuer } from './createAsyncQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncQueuer,
  AlpineAsyncQueuerOptions,
} from './createAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { AlpinePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  scope: PacerScope,
  fn: (item: TValue) => Promise<any>,
  options: AlpinePacerOptions<AlpineAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  AlpineAsyncQueuer<TValue, TSelected>['addItem'],
  AlpineAsyncQueuer<TValue, TSelected>,
] {
  const utility = createAsyncQueuer(scope, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
