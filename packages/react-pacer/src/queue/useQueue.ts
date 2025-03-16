import { useRef } from 'react'
import { Queue } from '@tanstack/pacer/queue'
import type { QueueOptions } from '@tanstack/pacer/queue'

export function useQueue<TValue>(options: QueueOptions<TValue> = {}) {
  const queueRef = useRef<Queue<TValue>>(null)

  if (!queueRef.current) {
    queueRef.current = new Queue(options)
  }

  return {
    clear: queueRef.current.clear.bind(queueRef.current),
    getNextItem: queueRef.current.getNextItem.bind(queueRef.current),
    addItem: queueRef.current.addItem.bind(queueRef.current),
    getAllItems: queueRef.current.getAllItems.bind(queueRef.current),
    isEmpty: queueRef.current.isEmpty.bind(queueRef.current),
    isFull: queueRef.current.isFull.bind(queueRef.current),
    peek: queueRef.current.peek.bind(queueRef.current),
    size: queueRef.current.size.bind(queueRef.current),
  } as const
}
