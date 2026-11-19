import { createComponent, createContext, useContext } from 'solid-js'
import type { Element } from 'solid-js'
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
  children: Element
  defaultOptions?: PacerProviderOptions
}

const DEFAULT_OPTIONS: PacerProviderOptions = {}

export function PacerProvider(props: PacerProviderProps) {
  const contextValue: PacerContextValue = {
    get defaultOptions() {
      return props.defaultOptions ?? DEFAULT_OPTIONS
    },
  }

  // Built without JSX so the adapter only depends on `solid-js`, not on the
  // `@solidjs/web` renderer that compiled JSX imports from.
  return createComponent(PacerContext, {
    value: contextValue,
    get children() {
      return props.children
    },
  })
}

export function usePacerContext() {
  return useContext(PacerContext)
}

export function useDefaultPacerOptions() {
  const context = useContext(PacerContext)
  return context?.defaultOptions ?? {}
}
