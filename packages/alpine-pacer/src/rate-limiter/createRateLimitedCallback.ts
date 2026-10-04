import { createRateLimiter } from './createRateLimiter'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineRateLimiter,
  AlpineRateLimiterOptions,
} from './createRateLimiter'
import type { AlpinePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineRateLimiterOptions<TFn>>,
): AlpineRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(scope, fn, options).maybeExecute
}
