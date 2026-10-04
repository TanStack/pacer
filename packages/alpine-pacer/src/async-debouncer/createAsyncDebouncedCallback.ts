import { createAsyncDebouncer } from './createAsyncDebouncer'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncDebouncer,
  AlpineAsyncDebouncerOptions,
} from './createAsyncDebouncer'
import type { AlpinePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createAsyncDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineAsyncDebouncerOptions<TFn>>,
): AlpineAsyncDebouncer<TFn>['maybeExecute'] {
  return createAsyncDebouncer(scope, fn, options).maybeExecute
}
