import { createContext, createElement, useContext } from 'octane'
import type { OctaneAsyncBatcherOptions } from '../async-batcher/useAsyncBatcher'
import type { OctaneAsyncDebouncerOptions } from '../async-debouncer/useAsyncDebouncer'
import type { OctaneAsyncQueuerOptions } from '../async-queuer/useAsyncQueuer'
import type { OctaneAsyncRateLimiterOptions } from '../async-rate-limiter/useAsyncRateLimiter'
import type { OctaneAsyncThrottlerOptions } from '../async-throttler/useAsyncThrottler'
import type { OctaneBatcherOptions } from '../batcher/useBatcher'
import type { OctaneDebouncerOptions } from '../debouncer/useDebouncer'
import type { OctaneQueuerOptions } from '../queuer/useQueuer'
import type { OctaneRateLimiterOptions } from '../rate-limiter/useRateLimiter'
import type { OctaneThrottlerOptions } from '../throttler/useThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<OctaneAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<OctaneAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<OctaneAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<OctaneAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<OctaneAsyncThrottlerOptions<any, any>>
  batcher?: Partial<OctaneBatcherOptions<any, any>>
  debouncer?: Partial<OctaneDebouncerOptions<any, any>>
  queuer?: Partial<OctaneQueuerOptions<any, any>>
  rateLimiter?: Partial<OctaneRateLimiterOptions<any, any>>
  throttler?: Partial<OctaneThrottlerOptions<any, any>>
}

const PacerContext = createContext<PacerProviderOptions | null>(null)
export interface PacerProviderProps {
  children?: unknown
  defaultOptions?: PacerProviderOptions
}
/** Sets defaults for utilities created by descendant components. */
export function PacerProvider({
  children,
  defaultOptions = {},
}: PacerProviderProps) {
  return createElement(PacerContext.Provider, {
    value: defaultOptions,
    children,
  })
}
/** Reads the nearest provider's defaults. Local options take precedence. */
export function useDefaultPacerOptions(): PacerProviderOptions {
  return useContext(PacerContext) ?? {}
}
