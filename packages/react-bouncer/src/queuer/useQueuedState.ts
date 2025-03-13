import { useState } from 'react'
import { useQueuer } from './useQueuer'
import type { QueueOptions } from '@tanstack/bouncer/queuer'

export function useQueuedState<TValue>(options: QueueOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const queuer = useQueuer<TValue>({
    ...options,
    onUpdate: (queuer) => {
      setState(queuer.getItems())
    },
  })

  return [state, queuer] as const
}
