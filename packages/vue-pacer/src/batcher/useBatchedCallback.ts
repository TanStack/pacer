import { useBatcher } from './useBatcher'
import type { VueBatcher, VueBatcherOptions } from './useBatcher'
import type { VuePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as useBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  options: VuePacerOptions<VueBatcherOptions<TValue>>,
): VueBatcher<TValue>['addItem'] {
  return useBatcher(fn, options).addItem
}
