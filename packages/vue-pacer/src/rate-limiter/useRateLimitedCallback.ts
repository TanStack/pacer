import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter, VueRateLimiterOptions } from './useRateLimiter'
import type { VuePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as useRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: VuePacerOptions<VueRateLimiterOptions<TFn>>,
): VueRateLimiter<TFn>['maybeExecute'] {
  return useRateLimiter(fn, options).maybeExecute
}
