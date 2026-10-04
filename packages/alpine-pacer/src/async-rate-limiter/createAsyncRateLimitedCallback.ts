import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineAsyncRateLimiter,
  AlpineAsyncRateLimiterOptions,
} from './createAsyncRateLimiter'
import type { AlpinePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createAsyncRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineAsyncRateLimiterOptions<TFn>>,
): AlpineAsyncRateLimiter<TFn>['maybeExecute'] {
  return createAsyncRateLimiter(scope, fn, options).maybeExecute
}
