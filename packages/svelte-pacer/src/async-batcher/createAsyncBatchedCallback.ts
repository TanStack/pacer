import { createAsyncBatcher } from './createAsyncBatcher'
import type {
  SvelteAsyncBatcher,
  SvelteAsyncBatcherOptions,
} from './createAsyncBatcher'
import type { SveltePacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createAsyncBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: SveltePacerOptions<SvelteAsyncBatcherOptions<TValue>>,
): SvelteAsyncBatcher<TValue>['addItem'] {
  return createAsyncBatcher(fn, options).addItem
}
