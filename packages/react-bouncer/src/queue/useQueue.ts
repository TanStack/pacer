import { useRef } from 'react'
import { Queue } from '@tanstack/bouncer/queue'
import type { QueueOptions } from '@tanstack/bouncer/queue'

export function useQueue<TValue>(options: QueueOptions<TValue> = {}) {
  const queueRef = useRef<Queue<TValue>>(null)

  if (!queueRef.current) {
    queueRef.current = new Queue(options)
  }

  return {
    clear: queueRef.current.clear.bind(queueRef.current),
    dequeue: queueRef.current.dequeue.bind(queueRef.current),
    enqueue: queueRef.current.enqueue.bind(queueRef.current),
    getItems: queueRef.current.getItems.bind(queueRef.current),
    isEmpty: queueRef.current.isEmpty.bind(queueRef.current),
    isFull: queueRef.current.isFull.bind(queueRef.current),
    peek: queueRef.current.peek.bind(queueRef.current),
    size: queueRef.current.size.bind(queueRef.current),
  } as const
}
