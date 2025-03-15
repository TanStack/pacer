import { createMemo } from 'solid-js'
import { AsyncThrottler } from '@tanstack/bouncer/async-throttler'
import type { AsyncThrottlerOptions } from '@tanstack/bouncer/async-throttler'

export function createAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  const asyncThrottler = createMemo(() => new AsyncThrottler(fn, options))

  return {
    maybeExecute: asyncThrottler().maybeExecute.bind(asyncThrottler()),
    cancel: asyncThrottler().cancel.bind(asyncThrottler()),
    getExecutionCount:
      asyncThrottler().getExecutionCount.bind(asyncThrottler()),
  } as const
}
