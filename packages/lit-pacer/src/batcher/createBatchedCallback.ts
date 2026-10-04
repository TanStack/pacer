import { createBatcher } from './createBatcher'
import type { ReactiveControllerHost } from 'lit'
import type { LitBatcher, LitBatcherOptions } from './createBatcher'
import type { LitPacerOptions } from '../types'
/**
 * Returns a stable batched callback with the same options and cleanup as createBatcher.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createBatchedCallback<TValue>(
  host: ReactiveControllerHost,
  fn: (items: Array<TValue>) => void,
  options: LitPacerOptions<LitBatcherOptions<TValue>>,
): LitBatcher<TValue>['addItem'] {
  return createBatcher(host, fn, options).addItem
}
