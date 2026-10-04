import { createAsyncBatcher } from './createAsyncBatcher'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncBatcher,
  LitAsyncBatcherOptions,
} from './createAsyncBatcher'
import type { LitPacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createAsyncBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncBatchedCallback<TValue>(
  host: ReactiveControllerHost,
  fn: (items: Array<TValue>) => Promise<any>,
  options: LitPacerOptions<LitAsyncBatcherOptions<TValue>>,
): LitAsyncBatcher<TValue>['addItem'] {
  return createAsyncBatcher(host, fn, options).addItem
}
