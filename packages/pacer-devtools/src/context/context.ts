import { createContext } from 'solid-js'
import type {
  AsyncBatcherState,
  AsyncDebouncerState,
  AsyncQueuerState,
  AsyncRateLimiterState,
  AsyncThrottlerState,
  BatcherState,
  DebouncerState,
  QueuerState,
  RateLimiterState,
  ThrottlerState,
} from '@tanstack/pacer'

type WithUuid<T> = T & { uuid: string }

export interface PacerContextType {
  asyncBatcherState: Array<WithUuid<AsyncBatcherState<any>>>
  asyncDebouncerState: Array<WithUuid<AsyncDebouncerState<any>>>
  asyncQueuerState: Array<WithUuid<AsyncQueuerState<any>>>
  asyncRateLimiterState: Array<WithUuid<AsyncRateLimiterState<any>>>
  asyncThrottlerState: Array<WithUuid<AsyncThrottlerState<any>>>
  batcherState: Array<WithUuid<BatcherState<any>>>
  debouncerState: Array<WithUuid<DebouncerState<any>>>
  queuerState: Array<WithUuid<QueuerState<any>>>
  rateLimiterState: Array<WithUuid<RateLimiterState>>
  throttlerState: Array<WithUuid<ThrottlerState<any>>>
}

export const initialStore = {
  asyncBatcherState: [],
  asyncDebouncerState: [],
  asyncQueuerState: [],
  asyncRateLimiterState: [],
  asyncThrottlerState: [],
  batcherState: [],
  debouncerState: [],
  queuerState: [],
  rateLimiterState: [],
  throttlerState: [],
}

export const PacerContext = createContext<
  [PacerContextType, (newState: Partial<PacerContextType>) => void]
>([initialStore, () => {}])
