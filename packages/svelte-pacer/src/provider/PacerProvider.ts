import { getContext, setContext } from 'svelte'
import type { SveltePacerOptions } from '../types'
import type { SvelteAsyncBatcherOptions } from '../async-batcher/createAsyncBatcher'
import type { SvelteAsyncDebouncerOptions } from '../async-debouncer/createAsyncDebouncer'
import type { SvelteAsyncQueuerOptions } from '../async-queuer/createAsyncQueuer'
import type { SvelteAsyncRateLimiterOptions } from '../async-rate-limiter/createAsyncRateLimiter'
import type { SvelteAsyncThrottlerOptions } from '../async-throttler/createAsyncThrottler'
import type { SvelteBatcherOptions } from '../batcher/createBatcher'
import type { SvelteDebouncerOptions } from '../debouncer/createDebouncer'
import type { SvelteQueuerOptions } from '../queuer/createQueuer'
import type { SvelteRateLimiterOptions } from '../rate-limiter/createRateLimiter'
import type { SvelteThrottlerOptions } from '../throttler/createThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<SvelteAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<SvelteAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<SvelteAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<SvelteAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<SvelteAsyncThrottlerOptions<any, any>>
  batcher?: Partial<SvelteBatcherOptions<any, any>>
  debouncer?: Partial<SvelteDebouncerOptions<any, any>>
  queuer?: Partial<SvelteQueuerOptions<any, any>>
  rateLimiter?: Partial<SvelteRateLimiterOptions<any, any>>
  throttler?: Partial<SvelteThrottlerOptions<any, any>>
}

const PacerContext = Symbol('Pacer')
/** Provides defaults during component initialization. Local options take precedence. */
export function providePacerOptions(
  options: SveltePacerOptions<PacerProviderOptions>,
) {
  setContext(PacerContext, () =>
    typeof options === 'function' ? options() : options,
  )
}
/** Reads reactive defaults from the nearest provider. */
export function useDefaultPacerOptions(): () => PacerProviderOptions {
  return (
    getContext<(() => PacerProviderOptions) | undefined>(PacerContext) ??
    (() => ({}))
  )
}
