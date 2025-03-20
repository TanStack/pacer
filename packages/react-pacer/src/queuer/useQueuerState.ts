import { useState } from 'react'
import { useQueuer } from './useQueuer'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

export function useQueuerState<TValue>(options: QueuerOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const queue = useQueuer<TValue>({
    ...options,
    onUpdate: (queue) => {
      setState(queue.getAllItems())
    },
  })

  return [state, queue] as const
}
