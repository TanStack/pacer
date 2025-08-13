import { createStore } from 'solid-js/store'
import { createContext, createEffect, onCleanup, useContext } from 'solid-js'
import { pacerEventClient } from '@tanstack/pacer/event-client'
import type {
  AsyncBatcher,
  AsyncDebouncer,
  AsyncQueuer,
  AsyncRateLimiter,
  AsyncThrottler,
  Batcher,
  Debouncer,
  Queuer,
  RateLimiter,
  Throttler,
} from '@tanstack/pacer'

interface PacerDevtoolsContextType {
  asyncBatchers: Array<AsyncBatcher<any>>
  asyncDebouncers: Array<AsyncDebouncer<any>>
  asyncQueuers: Array<AsyncQueuer<any>>
  asyncRateLimiters: Array<AsyncRateLimiter<any>>
  asyncThrottlers: Array<AsyncThrottler<any>>
  batchers: Array<Batcher<any>>
  debouncers: Array<Debouncer<any>>
  queuers: Array<Queuer<any>>
  rateLimiters: Array<RateLimiter<any>>
  throttlers: Array<Throttler<any>>
  lastUpdatedByKey: Record<string, number>
}

const initialPacerDevtoolsStore = {
  asyncBatchers: [],
  asyncDebouncers: [],
  asyncQueuers: [],
  asyncRateLimiters: [],
  asyncThrottlers: [],
  batchers: [],
  debouncers: [],
  queuers: [],
  rateLimiters: [],
  throttlers: [],
  lastUpdatedByKey: {},
}

const PacerDevtoolsContext = createContext<
  [
    PacerDevtoolsContextType,
    (newState: Partial<PacerDevtoolsContextType>) => void,
  ]
>([initialPacerDevtoolsStore, () => {}])

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
  const [store, setStore] = createStore<PacerDevtoolsContextType>(
    initialPacerDevtoolsStore,
  )

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
    <PacerDevtoolsContext.Provider value={[store, setStore]}>
      {props.children}
    </PacerDevtoolsContext.Provider>
  )
}

const usePacerDevtoolsContext = () => {
  const context = useContext(PacerDevtoolsContext)

  return context
}

export const usePacerDevtoolsState = () => {
  const [state] = usePacerDevtoolsContext()
  return state
}
