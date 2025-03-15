import { Queue } from '@tanstack/bouncer/queue'
import type { QueueOptions } from '@tanstack/bouncer/queue'

export function createQueue<TValue>(options: QueueOptions<TValue> = {}) {
  return new Queue(options)
}
