import { useState } from 'react'
import { useQueue } from './useQueue'
import type { QueueOptions } from '@tanstack/pacer/queue'

export function useQueueState<TValue>(options: QueueOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const queue = useQueue<TValue>({
    ...options,
    onUpdate: (queue) => {
      setState(queue.getAllItems())
    },
  })

  return [state, queue] as const
}
