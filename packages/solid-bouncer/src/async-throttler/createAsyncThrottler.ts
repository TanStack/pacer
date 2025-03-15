import { AsyncThrottler } from '@tanstack/bouncer/async-throttler'
import type { AsyncThrottlerOptions } from '@tanstack/bouncer/async-throttler'

export function createAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  return new AsyncThrottler(fn, options)
}
