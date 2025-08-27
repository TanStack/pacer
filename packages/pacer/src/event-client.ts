import { EventClient } from '@tanstack/devtools-event-client'
import type { AsyncBatcher } from './async-batcher'
import type { AsyncDebouncer } from './async-debouncer'
import type { AsyncQueuer } from './async-queuer'
import type { AsyncRateLimiter } from './async-rate-limiter'
import type { AsyncThrottler } from './async-throttler'
import type { Debouncer } from './debouncer'
import type { Batcher } from './batcher'
import type { Queuer } from './queuer'
import type { RateLimiter } from './rate-limiter'
import type { Throttler } from './throttler'

export interface PacerEventMap {
  'pacer:d-AsyncBatcher': AsyncBatcher<any>
  'pacer:d-AsyncDebouncer': AsyncDebouncer<any>
  'pacer:d-AsyncQueuer': AsyncQueuer<any>
  'pacer:d-AsyncRateLimiter': AsyncRateLimiter<any>
  'pacer:d-AsyncThrottler': AsyncThrottler<any>
  'pacer:d-Batcher': Batcher<any>
  'pacer:d-Debouncer': Debouncer<any>
  'pacer:d-Queuer': Queuer<any>
  'pacer:d-RateLimiter': RateLimiter<any>
  'pacer:d-Throttler': Throttler<any>
  'pacer:AsyncBatcher': AsyncBatcher<any>
  'pacer:AsyncDebouncer': AsyncDebouncer<any>
  'pacer:AsyncQueuer': AsyncQueuer<any>
  'pacer:AsyncRateLimiter': AsyncRateLimiter<any>
  'pacer:AsyncThrottler': AsyncThrottler<any>
  'pacer:Batcher': Batcher<any>
  'pacer:Debouncer': Debouncer<any>
  'pacer:Queuer': Queuer<any>
  'pacer:RateLimiter': RateLimiter<any>
  'pacer:Throttler': Throttler<any>
}

export type PacerEventName = keyof PacerEventMap extends `pacer:${infer T}`
  ? T
  : never

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
  payload: PacerEventMap[`pacer:${TSuffix}`],
) => {
  pacerEventClient.emit(event, payload)
}

export const pacerEventClient = new PacerEventClient()
