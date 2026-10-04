import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type {
  SvelteAsyncRateLimiter,
  SvelteAsyncRateLimiterOptions,
} from './createAsyncRateLimiter'
import type { SveltePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createAsyncRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncRateLimiterOptions<TFn>>,
): SvelteAsyncRateLimiter<TFn>['maybeExecute'] {
  return createAsyncRateLimiter(fn, options).maybeExecute
}
