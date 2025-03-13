import { useRef } from 'react'
import { Stacker } from '@tanstack/bouncer/stacker'
import type { StackOptions } from '@tanstack/bouncer/stacker'

export function useStacker<TValue>(options: StackOptions<TValue> = {}) {
  const stackerRef = useRef<Stacker<TValue>>(null)

  if (!stackerRef.current) {
    stackerRef.current = new Stacker(options)
  }

  return {
    clear: stackerRef.current.clear.bind(stackerRef.current),
    pop: stackerRef.current.pop.bind(stackerRef.current),
    push: stackerRef.current.push.bind(stackerRef.current),
    getItems: stackerRef.current.getItems.bind(stackerRef.current),
    isEmpty: stackerRef.current.isEmpty.bind(stackerRef.current),
    isFull: stackerRef.current.isFull.bind(stackerRef.current),
    peek: stackerRef.current.peek.bind(stackerRef.current),
    size: stackerRef.current.size.bind(stackerRef.current),
  } as const
}
