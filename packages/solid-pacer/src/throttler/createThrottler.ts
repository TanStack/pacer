import { Throttler } from '../../../pacer/dist/esm/throttler'
import type { ThrottlerOptions } from '../../../pacer/dist/esm/throttler'

export function createThrottler<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions) {
  return new Throttler(fn, options)
}
