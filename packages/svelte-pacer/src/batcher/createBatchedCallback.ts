import { createBatcher } from './createBatcher'
import type { SvelteBatcher, SvelteBatcherOptions } from './createBatcher'
import type { SveltePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  options: SveltePacerOptions<SvelteBatcherOptions<TValue>>,
): SvelteBatcher<TValue>['addItem'] {
  return createBatcher(fn, options).addItem
}
