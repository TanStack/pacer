import { useState } from 'react'
import { useStacker } from './useStacker'
import type { StackOptions } from '@tanstack/bouncer/stacker'

export function useStackedState<TValue>(options: StackOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const stacker = useStacker<TValue>({
    ...options,
    onUpdate: (stacker) => {
      setState(stacker.getItems())
    },
  })

  return [state, stacker] as const
}
