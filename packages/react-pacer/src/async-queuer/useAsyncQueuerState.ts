import { useState } from 'react'
import { useAsyncQueuer } from './useAsyncQueuer'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

export function useAsyncQueuerState<TValue>(
  options: AsyncQueuerOptions<TValue> = {},
) {
  const [state, setState] = useState<Array<() => Promise<TValue>>>(
    options.initialItems ?? [],
  )

  const queue = useAsyncQueuer<TValue>({
    ...options,
    onUpdate: (queue) => {
      setState(queue.getAllItems())
    },
  })

  return [state, queue] as const
}
