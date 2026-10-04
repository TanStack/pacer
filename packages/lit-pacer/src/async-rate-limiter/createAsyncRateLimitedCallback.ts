import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncRateLimiter,
  LitAsyncRateLimiterOptions,
} from './createAsyncRateLimiter'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createAsyncRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncRateLimiterOptions<TFn>>,
): LitAsyncRateLimiter<TFn>['maybeExecute'] {
  return createAsyncRateLimiter(host, fn, options).maybeExecute
}
