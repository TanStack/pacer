import { createAsyncBatcher } from './createAsyncBatcher'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncBatcher,
  LitAsyncBatcherOptions,
} from './createAsyncBatcher'
import type { LitPacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Lit lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. The returned Promise preserves the core result and error contract. An addition that only schedules a batch does not await the later batch result.
 *
 * ## State and ownership
 *
 * Use createAsyncBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createAsyncBatchedCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createAsyncBatchedCallback(this, async (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see createAsyncBatcher
 */
export function createAsyncBatchedCallback<TValue>(
  host: ReactiveControllerHost,
  fn: (items: Array<TValue>) => Promise<any>,
  options: LitPacerOptions<LitAsyncBatcherOptions<TValue>>,
): LitAsyncBatcher<TValue>['addItem'] {
  return createAsyncBatcher(host, fn, options).addItem
}
