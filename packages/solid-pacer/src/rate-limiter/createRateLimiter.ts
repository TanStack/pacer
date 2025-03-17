import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

export function createRateLimiter<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  return new RateLimiter(fn, options)
}
