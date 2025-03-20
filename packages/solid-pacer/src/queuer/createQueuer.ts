import { Queuer } from '@tanstack/pacer/queuer'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

export function createQueuer<TValue>(options: QueuerOptions<TValue>) {
  return new Queuer(options)
}
