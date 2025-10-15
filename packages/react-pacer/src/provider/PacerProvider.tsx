import React, { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type {
  AnyAsyncFunction,
  AnyFunction,
  AsyncBatcherOptions,
  AsyncDebouncerOptions,
  AsyncQueuerOptions,
  AsyncRateLimiterOptions,
  AsyncRetryerOptions,
  AsyncThrottlerOptions,
  BatcherOptions,
  DebouncerOptions,
  QueuerOptions,
  RateLimiterOptions,
  ThrottlerOptions,
} from '@tanstack/pacer'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<AsyncBatcherOptions<any>>
  asyncDebouncer?: Partial<AsyncDebouncerOptions<AnyAsyncFunction>>
  asyncQueuer?: Partial<AsyncQueuerOptions<any>>
  asyncRateLimiter?: Partial<AsyncRateLimiterOptions<AnyAsyncFunction>>
  asyncRetryer?: Partial<AsyncRetryerOptions<AnyAsyncFunction>>
  asyncThrottler?: Partial<AsyncThrottlerOptions<AnyAsyncFunction>>
  batcher?: Partial<BatcherOptions<any>>
  debouncer?: Partial<DebouncerOptions<AnyFunction>>
  queuer?: Partial<QueuerOptions<any>>
  rateLimiter?: Partial<RateLimiterOptions<AnyFunction>>
  throttler?: Partial<ThrottlerOptions<AnyFunction>>
}

interface PacerContextValue {
  defaultOptions: PacerProviderOptions
}

const PacerContext = createContext<PacerContextValue | null>(null)

export interface PacerProviderProps {
  children: ReactNode
  defaultOptions?: PacerProviderOptions
}

const DEFAULT_OPTIONS: PacerProviderOptions = {}

export function PacerProvider({
  children,
  defaultOptions = DEFAULT_OPTIONS,
}: PacerProviderProps) {
  const contextValue: PacerContextValue = useMemo(
    () => ({
      defaultOptions,
    }),
    [defaultOptions],
  )

  return (
    <PacerContext.Provider value={contextValue}>
      {children}
    </PacerContext.Provider>
  )
}

export function usePacerContext() {
  return useContext(PacerContext)
}

export function useDefaultPacerOptions() {
  const context = useContext(PacerContext)
  return context?.defaultOptions ?? {}
}
