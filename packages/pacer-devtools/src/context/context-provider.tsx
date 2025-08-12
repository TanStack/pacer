import { createStore } from 'solid-js/store'
import { createEffect, onCleanup } from 'solid-js'
import { pacerEventClient } from '@tanstack/pacer'
import { PacerContext, initialStore } from './context'
import type { PacerContextType } from './context'

const updateOrAddToArray = <T extends { key: string }>(
  oldArray: Array<T>,
  newItem: T,
) => {
  const index = oldArray.findIndex((item) => item.key === newItem.key)
  if (index !== -1) {
    // Update existing item
    return oldArray.map((item, i) => (i === index ? newItem : item))
  }
  // Add new item
  return [...oldArray, newItem]
}

export function PacerContextProvider(props: { children: any }) {
  const [store, setStore] = createStore<PacerContextType>(initialStore)

  createEffect(() => {
    const cleanup = pacerEventClient.onAllPluginEvents((e) => {
      switch (e.type) {
        case 'pacer:async-batcher-state': {
          const newItems = updateOrAddToArray(
            store.asyncBatcherState,
            e.payload,
          )
          setStore({ asyncBatcherState: newItems })
          break
        }
        case 'pacer:async-debouncer-state': {
          const newItems = updateOrAddToArray(
            store.asyncDebouncerState,
            e.payload,
          )
          setStore({ asyncDebouncerState: newItems })
          break
        }
        case 'pacer:async-queuer-state': {
          const newItems = updateOrAddToArray(store.asyncQueuerState, e.payload)
          setStore({ asyncQueuerState: newItems })
          break
        }
        case 'pacer:async-rate-limiter-state': {
          const newItems = updateOrAddToArray(
            store.asyncRateLimiterState,
            e.payload,
          )
          setStore({ asyncRateLimiterState: newItems })
          break
        }
        case 'pacer:async-throttler-state': {
          const newItems = updateOrAddToArray(
            store.asyncThrottlerState,
            e.payload,
          )
          setStore({ asyncThrottlerState: newItems })
          break
        }
        case 'pacer:batcher-state': {
          const newItems = updateOrAddToArray(store.batcherState, e.payload)
          setStore({ batcherState: newItems })
          break
        }
        case 'pacer:debouncer-state': {
          const newItems = updateOrAddToArray(store.debouncerState, e.payload)
          setStore({ debouncerState: newItems })
          break
        }
        case 'pacer:queuer-state': {
          const newItems = updateOrAddToArray(store.queuerState, e.payload)
          setStore({ queuerState: newItems })
          break
        }
        case 'pacer:rate-limiter-state': {
          const newItems = updateOrAddToArray(store.rateLimiterState, e.payload)
          setStore({ rateLimiterState: newItems })
          break
        }
        case 'pacer:throttler-state': {
          const newItems = updateOrAddToArray(store.throttlerState, e.payload)
          setStore({ throttlerState: newItems })
          break
        }
      }
    })
    onCleanup(cleanup)
  })
  return (
    <PacerContext.Provider value={[store, setStore]}>
      {props.children}
    </PacerContext.Provider>
  )
}
