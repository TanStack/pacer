import { AsyncThrottler } from '../../../pacer/dist/esm/async-throttler'
import type { AsyncThrottlerOptions } from '../../../pacer/dist/esm/async-throttler'

export function createAsyncThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncThrottlerOptions) {
  return new AsyncThrottler(fn, options)
}
