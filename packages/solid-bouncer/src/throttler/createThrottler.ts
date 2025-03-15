import { createMemo } from 'solid-js'
import { Throttler } from '@tanstack/bouncer/throttler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function createThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions) {
  const throttler = createMemo(() => new Throttler(fn, options))()

  return {
    maybeExecute: throttler.maybeExecute.bind(throttler),
    cancel: throttler.cancel.bind(throttler),
    getExecutionCount: throttler.getExecutionCount.bind(throttler),
  } as const
}
