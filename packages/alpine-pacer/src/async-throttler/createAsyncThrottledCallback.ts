import { createAsyncThrottler } from './createAsyncThrottler'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncThrottler,
  AlpineAsyncThrottlerOptions,
} from './createAsyncThrottler'
import type { AlpinePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createAsyncThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineAsyncThrottlerOptions<TFn>>,
): AlpineAsyncThrottler<TFn>['maybeExecute'] {
  return createAsyncThrottler(scope, fn, options).maybeExecute
}
