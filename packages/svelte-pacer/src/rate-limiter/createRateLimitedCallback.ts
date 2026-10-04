import { createRateLimiter } from './createRateLimiter'
import type {
  SvelteRateLimiter,
  SvelteRateLimiterOptions,
} from './createRateLimiter'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as createRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteRateLimiterOptions<TFn>>,
): SvelteRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(fn, options).maybeExecute
}
