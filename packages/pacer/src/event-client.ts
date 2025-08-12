import { EventClient } from '@tanstack/devtools-event-client'
import type { AsyncBatcherState } from './async-batcher'
import type { AsyncDebouncerState } from './async-debouncer'
import type { AsyncQueuerState } from './async-queuer'
import type { AsyncRateLimiterState } from './async-rate-limiter'
import type { AsyncThrottlerState } from './async-throttler'
import type { DebouncerState } from './debouncer'
import type { BatcherState } from './batcher'
import type { QueuerState } from './queuer'
import type { RateLimiterState } from './rate-limiter'
import type { ThrottlerState } from './throttler'

type WithUuid<T> = T & { uuid: string }

export interface PacerEventMap {
  'pacer:async-batcher-state': WithUuid<AsyncBatcherState<any>>
  'pacer:async-debouncer-state': WithUuid<AsyncDebouncerState<any>>
  'pacer:async-queuer-state': WithUuid<AsyncQueuerState<any>>
  'pacer:async-rate-limiter-state': WithUuid<AsyncRateLimiterState<any>>
  'pacer:async-throttler-state': WithUuid<AsyncThrottlerState<any>>
  'pacer:batcher-state': WithUuid<BatcherState<any>>
  'pacer:debouncer-state': WithUuid<DebouncerState<any>>
  'pacer:queuer-state': WithUuid<QueuerState<any>>
  'pacer:rate-limiter-state': WithUuid<RateLimiterState>
  'pacer:throttler-state': WithUuid<ThrottlerState<any>>
}

class PacerEventClient extends EventClient<PacerEventMap> {
  constructor(props?: { debug: boolean }) {
    super({
      pluginId: 'pacer',
      debug: props?.debug,
    })
  }
}

export const emitChange = <TSuffix extends Extract<keyof PacerEventMap, `${string}:${string}`> extends `${string}:${infer S}` ? S : never>(
  event: TSuffix,
  payload: PacerEventMap[`pacer:${TSuffix}`] & { uuid: string }
) => {
  pacerEventClient.emit(event, payload)
}

export const pacerEventClient = new PacerEventClient()
