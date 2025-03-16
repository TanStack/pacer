import { Queue } from '../../../pacer/dist/esm/queue'
import type { QueueOptions } from '../../../pacer/dist/esm/queue'

export function createQueue<TValue>(options: QueueOptions<TValue> = {}) {
  return new Queue(options)
}
