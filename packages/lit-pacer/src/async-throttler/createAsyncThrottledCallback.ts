import { createAsyncThrottler } from './createAsyncThrottler'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncThrottler,
  LitAsyncThrottlerOptions,
} from './createAsyncThrottler'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createAsyncThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncThrottlerOptions<TFn>>,
): LitAsyncThrottler<TFn>['maybeExecute'] {
  return createAsyncThrottler(host, fn, options).maybeExecute
}
