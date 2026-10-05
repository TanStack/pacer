import { createContext, useContext } from 'solid-js'
import type { JSX } from 'solid-js'
import type { SolidAsyncBatcherOptions } from '../async-batcher/createAsyncBatcher'
import type { SolidAsyncDebouncerOptions } from '../async-debouncer/createAsyncDebouncer'
import type { SolidAsyncQueuerOptions } from '../async-queuer/createAsyncQueuer'
import type { SolidAsyncRateLimiterOptions } from '../async-rate-limiter/createAsyncRateLimiter'
import type { SolidAsyncThrottlerOptions } from '../async-throttler/createAsyncThrottler'
import type { SolidBatcherOptions } from '../batcher/createBatcher'
import type { SolidDebouncerOptions } from '../debouncer/createDebouncer'
import type { SolidQueuerOptions } from '../queuer/createQueuer'
import type { SolidRateLimiterOptions } from '../rate-limiter/createRateLimiter'
import type { SolidThrottlerOptions } from '../throttler/createThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<SolidAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<SolidAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<SolidAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<SolidAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<SolidAsyncThrottlerOptions<any, any>>
  batcher?: Partial<SolidBatcherOptions<any, any>>
  debouncer?: Partial<SolidDebouncerOptions<any, any>>
  queuer?: Partial<SolidQueuerOptions<any, any>>
  rateLimiter?: Partial<SolidRateLimiterOptions<any, any>>
  throttler?: Partial<SolidThrottlerOptions<any, any>>
}

interface PacerContextValue {
  defaultOptions: PacerProviderOptions
}

const PacerContext = createContext<PacerContextValue | null>(null)

export interface PacerProviderProps {
  children: JSX.Element
  defaultOptions?: PacerProviderOptions
}

const DEFAULT_OPTIONS: PacerProviderOptions = {}

export function PacerProvider(props: PacerProviderProps) {
  const contextValue: PacerContextValue = {
    get defaultOptions() {
      return props.defaultOptions ?? DEFAULT_OPTIONS
    },
  }

  return (
    <PacerContext.Provider value={contextValue}>
      {props.children}
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
