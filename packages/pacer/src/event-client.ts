import { EventClient } from "@tanstack/devtools-event-client"
import type { AsyncBatcherState } from "./async-batcher"
import type { AsyncDebouncerState } from "./async-debouncer"
import type { AsyncQueuerState } from "./async-queuer"
import type { AsyncRateLimiterState } from "./async-rate-limiter"
import type { AsyncThrottlerState } from "./async-throttler"
import type { DebouncerState } from "./debouncer"
import type { BatcherState } from "./batcher"
import type { QueuerState } from "./queuer"
import type { RateLimiterState } from "./rate-limiter"
import type { ThrottlerState } from "./throttler"

export interface PacerEventMap {
  "pacer:async-batcher-state": AsyncBatcherState<any>
  "pacer:async-debouncer-state": AsyncDebouncerState<any>
  "pacer:async-queuer-state": AsyncQueuerState<any>
  "pacer:async-rate-limiter-state": AsyncRateLimiterState<any>
  "pacer:async-throttler-state": AsyncThrottlerState<any>
  "pacer:batcher-state": BatcherState<any>
  "pacer:debouncer-state": DebouncerState<any>
  "pacer:queuer-state": QueuerState<any>
  "pacer:rate-limiter-state": RateLimiterState
  "pacer:throttler-state": ThrottlerState<any>
}

export class PacerEventClient extends EventClient<PacerEventMap> {
  constructor(props?: {
    debug: boolean
  }) {
    super({
      pluginId: "pacer",
      debug: props?.debug
    })
  }
}

export const pacerEventClient = new PacerEventClient()