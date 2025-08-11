import { createStore } from 'solid-js/store'
import { createEffect, onCleanup } from 'solid-js'
import { pacerEventClient } from '@tanstack/pacer'
import { PacerContext, initialStore } from './context'
import type { PacerContextType } from './context'

export function PacerContextProvider(props: { children: any }) {
  const [store, setStore] = createStore<PacerContextType>(initialStore)
  const updateStore = (newState: Partial<PacerContextType>) => {
    setStore((prev) => ({ ...prev, ...newState }))
  }
  createEffect(() => {
    const cleanup = pacerEventClient.onAllPluginEvents((e) => {
      switch (e.type) {
        case 'pacer:async-batcher-state':
          updateStore({ asyncBatcherState: e.payload })
          break
        case 'pacer:async-debouncer-state':
          updateStore({ asyncDebouncerState: e.payload })
          break
        case 'pacer:async-queuer-state':
          updateStore({ asyncQueuerState: e.payload })
          break
        case 'pacer:async-rate-limiter-state':
          updateStore({ asyncRateLimiterState: e.payload })
          break
        case 'pacer:async-throttler-state':
          updateStore({ asyncThrottlerState: e.payload })
          break
        case 'pacer:batcher-state':
          updateStore({ batcherState: e.payload })
          break
        case 'pacer:debouncer-state':
          updateStore({ debouncerState: e.payload })
          break
        case 'pacer:queuer-state':
          updateStore({ queuerState: e.payload })
          break
        case 'pacer:rate-limiter-state':
          updateStore({ rateLimiterState: e.payload })
          break
        case 'pacer:throttler-state':
          updateStore({ throttlerState: e.payload })
          break
      }
    })
    onCleanup(cleanup)
  })
  return (
    <PacerContext.Provider value={[store, updateStore]}>
      {props.children}
    </PacerContext.Provider>
  )
}
