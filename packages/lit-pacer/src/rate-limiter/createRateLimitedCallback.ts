import { createRateLimiter } from './createRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { LitPacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitRateLimiterOptions<TFn>>,
): LitRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(host, fn, options).maybeExecute
}
