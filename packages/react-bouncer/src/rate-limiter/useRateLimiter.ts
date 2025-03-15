import { useRef } from 'react'
import { RateLimiter } from '@tanstack/bouncer/rate-limiter'
import type { RateLimiterOptions } from '@tanstack/bouncer/rate-limiter'

export function useRateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: RateLimiterOptions) {
  const rateLimiterRef = useRef<RateLimiter<TFn, TArgs>>(null)

  if (!rateLimiterRef.current) {
    rateLimiterRef.current = new RateLimiter(fn, options)
  }

  return {
    maybeExecute: rateLimiterRef.current.maybeExecute.bind(
      rateLimiterRef.current,
    ),
    getExecutionCount: rateLimiterRef.current.getExecutionCount.bind(
      rateLimiterRef.current,
    ),
    getRejectionCount: rateLimiterRef.current.getRejectionCount.bind(
      rateLimiterRef.current,
    ),
    getRemainingExecutions: rateLimiterRef.current.getRemainingExecutions.bind(
      rateLimiterRef.current,
    ),
    reset: rateLimiterRef.current.reset.bind(rateLimiterRef.current),
  } as const
}
