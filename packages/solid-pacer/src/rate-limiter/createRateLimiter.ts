import { RateLimiter } from '../../../pacer/dist/esm/rate-limiter'
import type { RateLimiterOptions } from '../../../pacer/dist/esm/rate-limiter'

export function createRateLimiter<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  return new RateLimiter(fn, options)
}
