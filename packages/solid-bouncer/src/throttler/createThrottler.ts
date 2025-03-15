import { Throttler } from '@tanstack/bouncer/throttler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function createThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions) {
  return new Throttler(fn, options)
}
