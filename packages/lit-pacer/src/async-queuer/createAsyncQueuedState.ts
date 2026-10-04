import { createAsyncQueuer } from './createAsyncQueuer'
import type { ReactiveControllerHost } from 'lit'
import type { LitAsyncQueuer, LitAsyncQueuerOptions } from './createAsyncQueuer'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { LitPacerOptions } from '../types'
/** Returns pending queue items, the addItem method, and the queue. Items are always selected. */
export function createAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
>(
  host: ReactiveControllerHost,
  fn: (item: TValue) => Promise<any>,
  options: LitPacerOptions<LitAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected,
): [
  () => Array<TValue>,
  LitAsyncQueuer<TValue, TSelected>['addItem'],
  LitAsyncQueuer<TValue, TSelected>,
] {
  const utility = createAsyncQueuer(host, fn, options, selector)
  return [() => utility.state.items, utility.addItem, utility]
}
