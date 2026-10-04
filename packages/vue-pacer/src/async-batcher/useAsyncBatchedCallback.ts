import { useAsyncBatcher } from './useAsyncBatcher'
import type { VueAsyncBatcher, VueAsyncBatcherOptions } from './useAsyncBatcher'
import type { VuePacerOptions } from '../types'
/**
 * Returns a stable batched callback owned by the Vue lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. The returned Promise preserves the core result and error contract. An addition that only schedules a batch does not await the later batch result.
 *
 * ## State and ownership
 *
 * Use useAsyncBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncBatchedCallback } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const schedule = useAsyncBatchedCallback(async (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncBatcher
 */
export function useAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: VuePacerOptions<VueAsyncBatcherOptions<TValue>>,
): VueAsyncBatcher<TValue>['addItem'] {
  return useAsyncBatcher(fn, options).addItem
}
