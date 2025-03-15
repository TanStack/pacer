import { createMemo } from 'solid-js'
import { RateLimiter } from '@tanstack/bouncer/rate-limiter'
import type { RateLimiterOptions } from '@tanstack/bouncer/rate-limiter'

export function createRateLimiter<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  const rateLimiter = createMemo(() => new RateLimiter(fn, options))

  return {
    maybeExecute: rateLimiter().maybeExecute.bind(rateLimiter()),
    getExecutionCount: rateLimiter().getExecutionCount.bind(rateLimiter()),
    getRejectionCount: rateLimiter().getRejectionCount.bind(rateLimiter()),
    getRemainingExecutions:
      rateLimiter().getRemainingExecutions.bind(rateLimiter()),
    reset: rateLimiter().reset.bind(rateLimiter()),
  } as const
}
