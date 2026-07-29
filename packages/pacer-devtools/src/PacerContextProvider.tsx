import { createStore, produce } from 'solid-js/store'
import { createContext, createEffect, onCleanup, useContext } from 'solid-js'
import {
  getPacerDevtoolsInstance,
  pacerEventClient,
  subscribeToPacerDevtoolsInstances,
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
 * Bus subscriptions preserve relayed devtools events. The instance subscription
 * below additionally replays same-runtime utilities when this provider mounts.
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
    const updateInstance = (
      event: PacerEventName,
      key: string,
      instance: unknown,
    ) => {
      if (!instance || typeof instance !== 'object') return

      const eventConfig = PACER_DEVTOOLS_UTIL_EVENTS.find(({ suffixes }) =>
        suffixes.includes(event),
      )
      if (!eventConfig) return

      setStore(
        produce((draft) => {
          const list = draft[eventConfig.listKey] as Array<{ key: string }>
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
    }

    const cleanups = [
      subscribeToPacerDevtoolsInstances(({ event, key, instance }) => {
        updateInstance(event, key, instance)
      }),
    ]

    for (const { suffixes } of PACER_DEVTOOLS_UTIL_EVENTS) {
      for (const suffix of suffixes) {
        cleanups.push(
          pacerEventClient.on(suffix, ({ payload }) => {
            updateInstance(
              suffix,
              payload.key,
              getPacerDevtoolsInstance(payload.key),
            )
          }),
        )
      }
    }

    onCleanup(() => {
      cleanups.forEach((cleanup) => cleanup())
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
