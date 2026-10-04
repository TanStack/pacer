import { createBatcher } from './createBatcher'
import type { SvelteBatcher, SvelteBatcherOptions } from './createBatcher'
import type { SveltePacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Svelte lifecycle.
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
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createBatchedCallback } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const schedule = createBatchedCallback((items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createBatcher
 */
export function createBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  options: SveltePacerOptions<SvelteBatcherOptions<TValue>>,
): SvelteBatcher<TValue>['addItem'] {
  return createBatcher(fn, options).addItem
}
