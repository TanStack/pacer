import { createBatcher } from './createBatcher'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineBatcher, AlpineBatcherOptions } from './createBatcher'
import type { AlpinePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createBatchedCallback<TValue>(
  scope: PacerScope,
  fn: (items: Array<TValue>) => void,
  options: AlpinePacerOptions<AlpineBatcherOptions<TValue>>,
): AlpineBatcher<TValue>['addItem'] {
  return createBatcher(scope, fn, options).addItem
}
