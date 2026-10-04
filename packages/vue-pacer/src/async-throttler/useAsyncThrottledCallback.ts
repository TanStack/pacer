import { useAsyncThrottler } from './useAsyncThrottler'
import type {
  VueAsyncThrottler,
  VueAsyncThrottlerOptions,
} from './useAsyncThrottler'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as useAsyncThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncThrottlerOptions<TFn>>,
): VueAsyncThrottler<TFn>['maybeExecute'] {
  return useAsyncThrottler(fn, options).maybeExecute
}
