import { useAsyncRateLimiter } from './useAsyncRateLimiter'
import type {
  VueAsyncRateLimiter,
  VueAsyncRateLimiterOptions,
} from './useAsyncRateLimiter'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as useAsyncRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncRateLimiterOptions<TFn>>,
): VueAsyncRateLimiter<TFn>['maybeExecute'] {
  return useAsyncRateLimiter(fn, options).maybeExecute
}
