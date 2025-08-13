import { createContext } from 'solid-js'
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

export interface PacerContextType {
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

export const initialStore = {
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

export const PacerContext = createContext<
  [PacerContextType, (newState: Partial<PacerContextType>) => void]
>([initialStore, () => {}])
