import { useRef } from 'react'
import { Throttler } from '@tanstack/pacer/throttler'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

export function useThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions) {
  const throttler = useRef<Throttler<TFn, TArgs>>(null)

  if (!throttler.current) {
    throttler.current = new Throttler(fn, options)
  }

  return {
    maybeExecute: throttler.current.maybeExecute.bind(throttler.current),
    cancel: throttler.current.cancel.bind(throttler.current),
    getExecutionCount: throttler.current.getExecutionCount.bind(
      throttler.current,
    ),
  } as const
}
