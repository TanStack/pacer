import { createStore, produce } from 'solid-js/store'
import { createContext, createEffect, onCleanup, useContext } from 'solid-js'
import {
  getPacerDevtoolsInstance,
  pacerEventClient,
} from '@tanstack/pacer/event-client'
import type {
  AsyncBatcher,
  AsyncDebouncer,
  AsyncQueuer,
  AsyncRateLimiter,
  AsyncThrottler,
  Batcher,
  Debouncer,
  PacerEventName,
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

type UtilListKey = Exclude<keyof PacerDevtoolsContextType, 'lastUpdatedByKey'>

/**
 * Match TanStack Form devtools: subscribe with {@link pacerEventClient.on} per
 * event suffix so the same `pacer:${suffix}` channel the library emits on is
 * observed. `onAllPluginEvents` only sees `tanstack-devtools-global`, which is
 * not always relayed the same way by the shell.
 *
 * `d-*` suffixes are used when the devtools panel pushes state back (see
 * ActionButtons); those must update the panel store too.
 */
const PACER_DEVTOOLS_UTIL_EVENTS: Array<{
  listKey: UtilListKey
  suffixes: ReadonlyArray<PacerEventName>
}> = [
  {
    listKey: 'asyncBatchers',
    suffixes: ['AsyncBatcher', 'd-AsyncBatcher'],
  },
  {
    listKey: 'asyncDebouncers',
    suffixes: ['AsyncDebouncer', 'd-AsyncDebouncer'],
  },
  {
    listKey: 'asyncQueuers',
    suffixes: ['AsyncQueuer', 'd-AsyncQueuer'],
  },
  {
    listKey: 'asyncRateLimiters',
    suffixes: ['AsyncRateLimiter', 'd-AsyncRateLimiter'],
  },
  {
    listKey: 'asyncThrottlers',
    suffixes: ['AsyncThrottler', 'd-AsyncThrottler'],
  },
  {
    listKey: 'batchers',
    suffixes: ['Batcher', 'd-Batcher'],
  },
  {
    listKey: 'debouncers',
    suffixes: ['Debouncer', 'd-Debouncer'],
  },
  {
    listKey: 'queuers',
    suffixes: ['Queuer', 'd-Queuer'],
  },
  {
    listKey: 'rateLimiters',
    suffixes: ['RateLimiter', 'd-RateLimiter'],
  },
  {
    listKey: 'throttlers',
    suffixes: ['Throttler', 'd-Throttler'],
  },
]

export function PacerContextProvider(props: { children: any }) {
  const [store, setStore] = createStore<PacerDevtoolsContextType>(
    initialPacerDevtoolsStore,
  )

  createEffect(() => {
    const cleanups: Array<() => void> = []

    for (const { listKey, suffixes } of PACER_DEVTOOLS_UTIL_EVENTS) {
      for (const suffix of suffixes) {
        cleanups.push(
          pacerEventClient.on(suffix, (e) => {
            const payload = e.payload
            const key = payload.key
            if (!key) return

            const instance = getPacerDevtoolsInstance(key)
            if (!instance || typeof instance !== 'object') return

            setStore(
              produce((draft) => {
                const list = draft[listKey] as Array<{ key: string }>
                const index = list.findIndex((item) => item.key === key)
                const inst = instance as { key: string }
                if (index !== -1) {
                  list[index] = inst as (typeof list)[number]
                } else {
                  list.push(inst as (typeof list)[number])
                }
                draft.lastUpdatedByKey[key] = Date.now()
              }),
            )
          }),
        )
      }
    }

    onCleanup(() => {
      for (const cleanup of cleanups) {
        cleanup()
      }
    })
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
