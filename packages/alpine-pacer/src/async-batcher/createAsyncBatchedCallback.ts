import { createAsyncBatcher } from './createAsyncBatcher'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncBatcher,
  AlpineAsyncBatcherOptions,
} from './createAsyncBatcher'
import type { AlpinePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createAsyncBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncBatchedCallback<TValue>(
  scope: PacerScope,
  fn: (items: Array<TValue>) => Promise<any>,
  options: AlpinePacerOptions<AlpineAsyncBatcherOptions<TValue>>,
): AlpineAsyncBatcher<TValue>['addItem'] {
  return createAsyncBatcher(scope, fn, options).addItem
}
