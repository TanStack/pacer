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
    const cleanup = pacerEventClient.onAllPluginEvents((_e) => {
      const e = _e as unknown as { type: string; payload: any }
      switch (e.type) {
        case 'pacer:async-batcher': {
          setStore({
            asyncBatchers: updateOrAddToArray(store.asyncBatchers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:async-debouncer': {
          setStore({
            asyncDebouncers: updateOrAddToArray(
              store.asyncDebouncers,
              e.payload,
            ),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:async-queuer': {
          setStore({
            asyncQueuers: updateOrAddToArray(store.asyncQueuers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:async-rate-limiter': {
          setStore({
            asyncRateLimiters: updateOrAddToArray(
              store.asyncRateLimiters,
              e.payload,
            ),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:async-throttler': {
          setStore({
            asyncThrottlers: updateOrAddToArray(
              store.asyncThrottlers,
              e.payload,
            ),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:batcher': {
          setStore({
            batchers: updateOrAddToArray(store.batchers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:debouncer': {
          setStore({
            debouncers: updateOrAddToArray(store.debouncers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:queuer': {
          setStore({
            queuers: updateOrAddToArray(store.queuers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:rate-limiter': {
          setStore({
            rateLimiters: updateOrAddToArray(store.rateLimiters, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
          break
        }
        case 'pacer:throttler': {
          setStore({
            throttlers: updateOrAddToArray(store.throttlers, e.payload),
            lastUpdatedByKey: {
              ...store.lastUpdatedByKey,
              [e.payload.key]: Date.now(),
            },
          })
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
