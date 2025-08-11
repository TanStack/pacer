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

export interface PacerContextType {
  asyncBatcherState: AsyncBatcherState<any> | undefined
  asyncDebouncerState: AsyncDebouncerState<any> | undefined
  asyncQueuerState: AsyncQueuerState<any> | undefined
  asyncRateLimiterState: AsyncRateLimiterState<any> | undefined
  asyncThrottlerState: AsyncThrottlerState<any> | undefined
  batcherState: BatcherState<any> | undefined
  debouncerState: DebouncerState<any> | undefined
  queuerState: QueuerState<any> | undefined
  rateLimiterState: RateLimiterState | undefined
  throttlerState: ThrottlerState<any> | undefined
}

export const initialStore = {
  asyncBatcherState: undefined,
  asyncDebouncerState: undefined,
  asyncQueuerState: undefined,
  asyncRateLimiterState: undefined,
  asyncThrottlerState: undefined,
  batcherState: undefined,
  debouncerState: undefined,
  queuerState: undefined,
  rateLimiterState: undefined,
  throttlerState: undefined,
}

export const PacerContext = createContext<
  [PacerContextType, (newState: Partial<PacerContextType>) => void]
>([initialStore, () => {}])
