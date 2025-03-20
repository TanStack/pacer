import { useRef } from 'react'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import type { AsyncThrottlerOptions } from '@tanstack/pacer/async-throttler'

export function useAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  const asyncThrottler = useRef<AsyncThrottler<TFn, TArgs>>(null)

  if (!asyncThrottler.current) {
    asyncThrottler.current = new AsyncThrottler(fn, options)
  }

  return {
    maybeExecute: asyncThrottler.current.maybeExecute.bind(
      asyncThrottler.current,
    ),
    cancel: asyncThrottler.current.cancel.bind(asyncThrottler.current),
    getExecutionCount: asyncThrottler.current.getExecutionCount.bind(
      asyncThrottler.current,
    ),
  } as const
}
