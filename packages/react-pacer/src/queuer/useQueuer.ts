import { useRef } from 'react'
import { Queuer } from '@tanstack/pacer/queuer'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

export function useQueuer<TValue>(options: QueuerOptions<TValue>) {
  const queuer = useRef<Queuer<TValue>>(null)

  if (!queuer.current) {
    queuer.current = new Queuer(options)
  }

  return {
    addItem: queuer.current.addItem.bind(queuer.current),
    clear: queuer.current.clear.bind(queuer.current),
    getAllItems: queuer.current.getAllItems.bind(queuer.current),
    getExecutionCount: queuer.current.getExecutionCount.bind(queuer.current),
    getNextItem: queuer.current.getNextItem.bind(queuer.current),
    isEmpty: queuer.current.isEmpty.bind(queuer.current),
    isFull: queuer.current.isFull.bind(queuer.current),
    isRunning: queuer.current.isRunning.bind(queuer.current),
    isIdle: queuer.current.isIdle.bind(queuer.current),
    onUpdate: queuer.current.onUpdate.bind(queuer.current),
    peek: queuer.current.peek.bind(queuer.current),
    reset: queuer.current.reset.bind(queuer.current),
    size: queuer.current.size.bind(queuer.current),
    start: queuer.current.start.bind(queuer.current),
    stop: queuer.current.stop.bind(queuer.current),
  }
}
