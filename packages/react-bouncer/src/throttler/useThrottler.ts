import { useRef } from 'react'
import { Throttler } from '@tanstack/bouncer/throttler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function useThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions) {
  const throttlerRef = useRef<Throttler<TFn, TArgs>>(null)

  if (!throttlerRef.current) {
    throttlerRef.current = new Throttler(fn, options)
  }

  return {
    throttle: throttlerRef.current.throttle.bind(throttlerRef.current),
    cancel: throttlerRef.current.cancel.bind(throttlerRef.current),
    getExecutionCount: throttlerRef.current.getExecutionCount.bind(
      throttlerRef.current,
    ),
  } as const
}
