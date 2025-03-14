import { useRef } from 'react'
import { Stack } from '@tanstack/bouncer/data-structures/stack'
import type { StackOptions } from '@tanstack/bouncer/data-structures/stack'

export function useStack<TValue>(options: StackOptions<TValue> = {}) {
  const stackRef = useRef<Stack<TValue>>(null)

  if (!stackRef.current) {
    stackRef.current = new Stack(options)
  }

  return {
    clear: stackRef.current.clear.bind(stackRef.current),
    pop: stackRef.current.pop.bind(stackRef.current),
    push: stackRef.current.push.bind(stackRef.current),
    getItems: stackRef.current.getItems.bind(stackRef.current),
    isEmpty: stackRef.current.isEmpty.bind(stackRef.current),
    isFull: stackRef.current.isFull.bind(stackRef.current),
    peek: stackRef.current.peek.bind(stackRef.current),
    size: stackRef.current.size.bind(stackRef.current),
  } as const
}
