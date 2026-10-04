import type { ReactiveControllerHost } from 'lit'
import type { LitPacerOptions } from '../types'
import type { LitAsyncBatcherOptions } from '../async-batcher/createAsyncBatcher'
import type { LitAsyncDebouncerOptions } from '../async-debouncer/createAsyncDebouncer'
import type { LitAsyncQueuerOptions } from '../async-queuer/createAsyncQueuer'
import type { LitAsyncRateLimiterOptions } from '../async-rate-limiter/createAsyncRateLimiter'
import type { LitAsyncThrottlerOptions } from '../async-throttler/createAsyncThrottler'
import type { LitBatcherOptions } from '../batcher/createBatcher'
import type { LitDebouncerOptions } from '../debouncer/createDebouncer'
import type { LitQueuerOptions } from '../queuer/createQueuer'
import type { LitRateLimiterOptions } from '../rate-limiter/createRateLimiter'
import type { LitThrottlerOptions } from '../throttler/createThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<LitAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<LitAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<LitAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<LitAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<LitAsyncThrottlerOptions<any, any>>
  batcher?: Partial<LitBatcherOptions<any, any>>
  debouncer?: Partial<LitDebouncerOptions<any, any>>
  queuer?: Partial<LitQueuerOptions<any, any>>
  rateLimiter?: Partial<LitRateLimiterOptions<any, any>>
  throttler?: Partial<LitThrottlerOptions<any, any>>
}

const defaults = new WeakMap<
  ReactiveControllerHost,
  () => PacerProviderOptions
>()
/** Supplies reactive defaults for utilities owned by this host. Call before constructing utilities. */
export function providePacerOptions(
  host: ReactiveControllerHost,
  options: LitPacerOptions<PacerProviderOptions>,
) {
  defaults.set(host, () =>
    typeof options === 'function' ? options() : options,
  )
}
/** Reads defaults for the host on each update. */
export function useDefaultPacerOptions(
  host: ReactiveControllerHost,
): () => PacerProviderOptions {
  return () => defaults.get(host)?.() ?? {}
}
