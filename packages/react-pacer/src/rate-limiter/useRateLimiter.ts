import { useRef } from 'react'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import type { RateLimiterOptions } from '@tanstack/pacer/rate-limiter'

export function useRateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  const rateLimiter = useRef<RateLimiter<TFn, TArgs>>(null)

  if (!rateLimiter.current) {
    rateLimiter.current = new RateLimiter(fn, options)
  }

  return {
    maybeExecute: rateLimiter.current.maybeExecute.bind(rateLimiter.current),
    getExecutionCount: rateLimiter.current.getExecutionCount.bind(
      rateLimiter.current,
    ),
    getRejectionCount: rateLimiter.current.getRejectionCount.bind(
      rateLimiter.current,
    ),
    getRemainingExecutions: rateLimiter.current.getRemainingExecutions.bind(
      rateLimiter.current,
    ),
    reset: rateLimiter.current.reset.bind(rateLimiter.current),
  } as const
}
