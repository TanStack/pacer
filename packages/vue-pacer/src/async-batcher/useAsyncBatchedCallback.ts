import { useAsyncBatcher } from './useAsyncBatcher'
import type { VueAsyncBatcher, VueAsyncBatcherOptions } from './useAsyncBatcher'
import type { VuePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as useAsyncBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: VuePacerOptions<VueAsyncBatcherOptions<TValue>>,
): VueAsyncBatcher<TValue>['addItem'] {
  return useAsyncBatcher(fn, options).addItem
}
