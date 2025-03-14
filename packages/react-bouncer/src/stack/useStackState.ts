import { useState } from 'react'
import { useStack } from './useStack'
import type { StackOptions } from '@tanstack/bouncer/data-structures/stack'

export function useStackState<TValue>(options: StackOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const stack = useStack<TValue>({
    ...options,
    onUpdate: (s) => {
      setState(s.getItems())
    },
  })

  return [state, stack] as const
}
