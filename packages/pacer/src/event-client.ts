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

type WithKey<T> = T & { key: string }

export interface PacerEventMap {
  'pacer:async-batcher-state': WithKey<AsyncBatcherState<any>>
  'pacer:async-debouncer-state': WithKey<AsyncDebouncerState<any>>
  'pacer:async-queuer-state': WithKey<AsyncQueuerState<any>>
  'pacer:async-rate-limiter-state': WithKey<AsyncRateLimiterState<any>>
  'pacer:async-throttler-state': WithKey<AsyncThrottlerState<any>>
  'pacer:batcher-state': WithKey<BatcherState<any>>
  'pacer:debouncer-state': WithKey<DebouncerState<any>>
  'pacer:queuer-state': WithKey<QueuerState<any>>
  'pacer:rate-limiter-state': WithKey<RateLimiterState>
  'pacer:throttler-state': WithKey<ThrottlerState<any>>
}

class PacerEventClient extends EventClient<PacerEventMap> {
  constructor(props?: { debug: boolean }) {
    super({
      pluginId: 'pacer',
      debug: props?.debug,
    })
  }
}

export const emitChange = <
  TSuffix extends Extract<
    keyof PacerEventMap,
    `${string}:${string}`
  > extends `${string}:${infer S}`
    ? S
    : never,
>(
  event: TSuffix,
  payload: PacerEventMap[`pacer:${TSuffix}`] & { key: string },
) => {
  pacerEventClient.emit(event, payload)
}

export const pacerEventClient = new PacerEventClient()
