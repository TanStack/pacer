import { createBatcher } from './createBatcher'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineBatcher, AlpineBatcherOptions } from './createBatcher'
import type { AlpinePacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Alpine lifecycle.
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
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createBatchedCallback } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const schedule = createBatchedCallback(scope, (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createBatcher
 */
export function createBatchedCallback<TValue>(
  scope: PacerScope,
  fn: (items: Array<TValue>) => void,
  options: AlpinePacerOptions<AlpineBatcherOptions<TValue>>,
): AlpineBatcher<TValue>['addItem'] {
  return createBatcher(scope, fn, options).addItem
}
