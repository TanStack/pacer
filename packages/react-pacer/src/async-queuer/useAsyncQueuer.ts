import { useRef } from 'react'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

export function useAsyncQueuer<TValue>(options: AsyncQueuerOptions<TValue>) {
  const asyncQueuer = useRef<AsyncQueuer<TValue> | null>(null)

  if (!asyncQueuer.current) {
    asyncQueuer.current = new AsyncQueuer(options)
  }

  return {
    addItem: asyncQueuer.current.addItem.bind(asyncQueuer.current),
    clear: asyncQueuer.current.clear.bind(asyncQueuer.current),
    getActive: asyncQueuer.current.getActive.bind(asyncQueuer.current),
    getAll: asyncQueuer.current.getAll.bind(asyncQueuer.current),
    getAllItems: asyncQueuer.current.getAllItems.bind(asyncQueuer.current),
    getExecutionCount: asyncQueuer.current.getExecutionCount.bind(
      asyncQueuer.current,
    ),
    getNextItem: asyncQueuer.current.getNextItem.bind(asyncQueuer.current),
    getPending: asyncQueuer.current.getPending.bind(asyncQueuer.current),
    isEmpty: asyncQueuer.current.isEmpty.bind(asyncQueuer.current),
    isFull: asyncQueuer.current.isFull.bind(asyncQueuer.current),
    isIdle: asyncQueuer.current.isIdle.bind(asyncQueuer.current),
    isRunning: asyncQueuer.current.isRunning.bind(asyncQueuer.current),
    isSettled: asyncQueuer.current.isSettled.bind(asyncQueuer.current),
    onError: asyncQueuer.current.onError.bind(asyncQueuer.current),
    onSettled: asyncQueuer.current.onSettled.bind(asyncQueuer.current),
    onSuccess: asyncQueuer.current.onSuccess.bind(asyncQueuer.current),
    onUpdate: asyncQueuer.current.onUpdate.bind(asyncQueuer.current),
    peek: asyncQueuer.current.peek.bind(asyncQueuer.current),
    reset: asyncQueuer.current.reset.bind(asyncQueuer.current),
    size: asyncQueuer.current.size.bind(asyncQueuer.current),
    start: asyncQueuer.current.start.bind(asyncQueuer.current),
    stop: asyncQueuer.current.stop.bind(asyncQueuer.current),
    throttle: asyncQueuer.current.throttle.bind(asyncQueuer.current),
  }
}
