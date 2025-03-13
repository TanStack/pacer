import { useRef } from 'react'
import { Queuer } from '@tanstack/bouncer/queuer'
import type { QueueOptions } from '@tanstack/bouncer/queuer'

export function useQueuer<TValue>(options: QueueOptions<TValue> = {}) {
  const queuerRef = useRef<Queuer<TValue>>(null)

  if (!queuerRef.current) {
    queuerRef.current = new Queuer(options)
  }

  return {
    clear: queuerRef.current.clear.bind(queuerRef.current),
    dequeue: queuerRef.current.dequeue.bind(queuerRef.current),
    enqueue: queuerRef.current.enqueue.bind(queuerRef.current),
    getItems: queuerRef.current.getItems.bind(queuerRef.current),
    isEmpty: queuerRef.current.isEmpty.bind(queuerRef.current),
    isFull: queuerRef.current.isFull.bind(queuerRef.current),
    peek: queuerRef.current.peek.bind(queuerRef.current),
    size: queuerRef.current.size.bind(queuerRef.current),
  } as const
}
