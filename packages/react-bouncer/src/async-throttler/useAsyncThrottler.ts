import { useRef } from 'react'
import { AsyncThrottler } from '@tanstack/bouncer/async-throttler'
import type { AsyncThrottlerOptions } from '@tanstack/bouncer/async-throttler'

export function useAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  const asyncThrottlerRef = useRef<AsyncThrottler<TFn, TArgs>>(null)

  if (!asyncThrottlerRef.current) {
    asyncThrottlerRef.current = new AsyncThrottler(fn, options)
  }

  return {
    maybeExecute: asyncThrottlerRef.current.maybeExecute.bind(
      asyncThrottlerRef.current,
    ),
    cancel: asyncThrottlerRef.current.cancel.bind(asyncThrottlerRef.current),
    getExecutionCount: asyncThrottlerRef.current.getExecutionCount.bind(
      asyncThrottlerRef.current,
    ),
  } as const
}
