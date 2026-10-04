import { createAsyncDebouncer } from './createAsyncDebouncer'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncDebouncer,
  LitAsyncDebouncerOptions,
} from './createAsyncDebouncer'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createAsyncDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncDebouncerOptions<TFn>>,
): LitAsyncDebouncer<TFn>['maybeExecute'] {
  return createAsyncDebouncer(host, fn, options).maybeExecute
}
