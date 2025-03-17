import { Queue } from '@tanstack/pacer/queue'
import type { QueueOptions } from '@tanstack/pacer/queue'

export function createQueue<TValue>(options: QueueOptions<TValue> = {}) {
  return new Queue(options)
}
