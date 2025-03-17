import { AsyncQueuer } from '../../../pacer/dist/esm/async-queuer'
import type { AsyncQueuerOptions } from '../../../pacer/dist/esm/async-queuer'

export function createAsyncQueuer<TValue>(options: AsyncQueuerOptions<TValue>) {
  return new AsyncQueuer(options)
}
