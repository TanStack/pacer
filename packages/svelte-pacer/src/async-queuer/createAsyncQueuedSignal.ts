import { createAsyncQueuer } from './createAsyncQueuer'
import type {
  SvelteAsyncQueuer,
  SvelteAsyncQueuerOptions,
} from './createAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { SveltePacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createAsyncQueuedSignal<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  fn: (item: TValue) => Promise<any>,
  options: SveltePacerOptions<SvelteAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  SvelteAsyncQueuer<TValue, TSelected>['addItem'],
  SvelteAsyncQueuer<TValue, TSelected>,
] {
  const utility = createAsyncQueuer(fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
