import { createAsyncThrottler } from './createAsyncThrottler'
import type {
  SvelteAsyncThrottler,
  SvelteAsyncThrottlerOptions,
} from './createAsyncThrottler'
import type { SveltePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createAsyncThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncThrottlerOptions<TFn>>,
): SvelteAsyncThrottler<TFn>['maybeExecute'] {
  return createAsyncThrottler(fn, options).maybeExecute
}
