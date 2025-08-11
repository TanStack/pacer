import { createStore } from 'solid-js/store'
import { createEffect, onCleanup } from 'solid-js'
import { pacerEventClient } from '@tanstack/pacer'
import { PacerContext, initialStore } from './context'
import type { PacerContextType } from './context'

export function PacerContextProvider(props: { children: any }) {
  const [store, setStore] = createStore<PacerContextType>(initialStore)

  createEffect(() => {
    const cleanup = pacerEventClient.onAllPluginEvents((e) => {
      switch (e.type) {
        case 'pacer:async-batcher-state':
          setStore({ asyncBatcherState: e.payload })
          break
        case 'pacer:async-debouncer-state':
          setStore({ asyncDebouncerState: e.payload })
          break
        case 'pacer:async-queuer-state':
          setStore({ asyncQueuerState: e.payload })
          break
        case 'pacer:async-rate-limiter-state':
          setStore({ asyncRateLimiterState: e.payload })
          break
        case 'pacer:async-throttler-state':
          setStore({ asyncThrottlerState: e.payload })
          break
        case 'pacer:batcher-state':
          setStore({ batcherState: e.payload })
          break
        case 'pacer:debouncer-state':
          setStore({ debouncerState: e.payload })
          break
        case 'pacer:queuer-state':
          setStore({ queuerState: e.payload })
          break
        case 'pacer:rate-limiter-state':
          setStore({ rateLimiterState: e.payload })
          break
        case 'pacer:throttler-state':
          setStore({ throttlerState: e.payload })
          break
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
