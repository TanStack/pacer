import { createMemo } from 'solid-js'
import { Queue } from '@tanstack/bouncer/queue'
import type { QueueOptions } from '@tanstack/bouncer/queue'

export function createQueue<TValue>(options: QueueOptions<TValue> = {}) {
  const queue = createMemo(() => new Queue(options))

  return {
    clear: queue().clear.bind(queue()),
    getNextItem: queue().getNextItem.bind(queue()),
    addItem: queue().addItem.bind(queue()),
    getAllItems: queue().getAllItems.bind(queue()),
    isEmpty: queue().isEmpty.bind(queue()),
    isFull: queue().isFull.bind(queue()),
    peek: queue().peek.bind(queue()),
    size: queue().size.bind(queue()),
  } as const
}
