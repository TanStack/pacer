import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

export function createAsyncQueuer<TValue>(options: AsyncQueuerOptions<TValue>) {
  return new AsyncQueuer(options)
}
