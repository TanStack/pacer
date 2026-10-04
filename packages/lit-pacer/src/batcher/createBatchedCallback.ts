import { createBatcher } from './createBatcher'
import type { ReactiveControllerHost } from 'lit'
import type { LitBatcher, LitBatcherOptions } from './createBatcher'
import type { LitPacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Lit lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use createBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createBatchedCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createBatchedCallback(this, (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createBatcher
 */
export function createBatchedCallback<TValue>(
  host: ReactiveControllerHost,
  fn: (items: Array<TValue>) => void,
  options: LitPacerOptions<LitBatcherOptions<TValue>>,
): LitBatcher<TValue>['addItem'] {
  return createBatcher(host, fn, options).addItem
}
