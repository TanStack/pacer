import { createMemo } from 'solid-js'
import { AsyncQueuer } from '@tanstack/bouncer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/bouncer/async-queuer'

export function createAsyncQueuer<TValue>(options: AsyncQueuerOptions<TValue>) {
  const asyncQueuer = createMemo(() => new AsyncQueuer(options))

  return {
    clear: asyncQueuer().clear.bind(asyncQueuer()),
    addItem: asyncQueuer().addItem.bind(asyncQueuer()),
    getActive: asyncQueuer().getActive.bind(asyncQueuer()),
    getAll: asyncQueuer().getAll.bind(asyncQueuer()),
    getPending: asyncQueuer().getPending.bind(asyncQueuer()),
    isRunning: asyncQueuer().isRunning.bind(asyncQueuer()),
    isSettled: asyncQueuer().isSettled.bind(asyncQueuer()),
    onError: asyncQueuer().onError.bind(asyncQueuer()),
    onSettled: asyncQueuer().onSettled.bind(asyncQueuer()),
    onSuccess: asyncQueuer().onSuccess.bind(asyncQueuer()),
    peek: asyncQueuer().peek.bind(asyncQueuer()),
    start: asyncQueuer().start.bind(asyncQueuer()),
    stop: asyncQueuer().stop.bind(asyncQueuer()),
    throttle: asyncQueuer().throttle.bind(asyncQueuer()),
  } as const
}
