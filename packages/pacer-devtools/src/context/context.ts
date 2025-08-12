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

type WithKey<T> = T & { key: string }

export interface PacerContextType {
  asyncBatcherState: Array<WithKey<AsyncBatcherState<any>>>
  asyncDebouncerState: Array<WithKey<AsyncDebouncerState<any>>>
  asyncQueuerState: Array<WithKey<AsyncQueuerState<any>>>
  asyncRateLimiterState: Array<WithKey<AsyncRateLimiterState<any>>>
  asyncThrottlerState: Array<WithKey<AsyncThrottlerState<any>>>
  batcherState: Array<WithKey<BatcherState<any>>>
  debouncerState: Array<WithKey<DebouncerState<any>>>
  queuerState: Array<WithKey<QueuerState<any>>>
  rateLimiterState: Array<WithKey<RateLimiterState>>
  throttlerState: Array<WithKey<ThrottlerState<any>>>
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
