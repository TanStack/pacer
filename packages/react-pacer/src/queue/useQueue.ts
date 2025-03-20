import { useRef } from 'react'
import { Queue } from '@tanstack/pacer/queue'
import type { QueueOptions } from '@tanstack/pacer/queue'

export function useQueue<TValue>(options: QueueOptions<TValue> = {}) {
  const queue = useRef<Queue<TValue>>(null)

  if (!queue.current) {
    queue.current = new Queue(options)
  }

  return {
    clear: queue.current.clear.bind(queue.current),
    getNextItem: queue.current.getNextItem.bind(queue.current),
    addItem: queue.current.addItem.bind(queue.current),
    getAllItems: queue.current.getAllItems.bind(queue.current),
    isEmpty: queue.current.isEmpty.bind(queue.current),
    isFull: queue.current.isFull.bind(queue.current),
    peek: queue.current.peek.bind(queue.current),
    size: queue.current.size.bind(queue.current),
  } as const
}
