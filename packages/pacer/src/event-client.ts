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
  'pacer:async-batcher': AsyncBatcher<any>
  'pacer:async-debouncer': AsyncDebouncer<any>
  'pacer:async-queuer': AsyncQueuer<any>
  'pacer:async-rate-limiter': AsyncRateLimiter<any>
  'pacer:async-throttler': AsyncThrottler<any>
  'pacer:batcher': Batcher<any>
  'pacer:debouncer': Debouncer<any>
  'pacer:queuer': Queuer<any>
  'pacer:rate-limiter': RateLimiter<any>
  'pacer:throttler': Throttler<any>
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
  payload: PacerEventMap[`pacer:${TSuffix}`],
) => {
  pacerEventClient.emit(event, payload)
}

export const pacerEventClient = new PacerEventClient()
