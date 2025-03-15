import { AsyncQueuer } from '@tanstack/bouncer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/bouncer/async-queuer'

export function createAsyncQueuer<TValue>(options: AsyncQueuerOptions<TValue>) {
  return new AsyncQueuer(options)
}
