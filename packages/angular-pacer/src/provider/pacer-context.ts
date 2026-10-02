import { InjectionToken, inject } from '@angular/core'
import type { AngularAsyncBatcherOptions } from '../async-batcher/injectAsyncBatcher'
import type { AngularAsyncDebouncerOptions } from '../async-debouncer/injectAsyncDebouncer'
import type { AngularAsyncQueuerOptions } from '../async-queuer/injectAsyncQueuer'
import type { AngularAsyncRateLimiterOptions } from '../async-rate-limiter/injectAsyncRateLimiter'
import type { AngularAsyncThrottlerOptions } from '../async-throttler/injectAsyncThrottler'
import type { AngularBatcherOptions } from '../batcher/injectBatcher'
import type { AngularDebouncerOptions } from '../debouncer/injectDebouncer'
import type { AngularQueuerOptions } from '../queuer/injectQueuer'
import type { AngularRateLimiterOptions } from '../rate-limiter/injectRateLimiter'
import type { AngularThrottlerOptions } from '../throttler/injectThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<AngularAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<AngularAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<AngularAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<AngularAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<AngularAsyncThrottlerOptions<any, any>>
  batcher?: Partial<AngularBatcherOptions<any, any>>
  debouncer?: Partial<AngularDebouncerOptions<any, any>>
  queuer?: Partial<AngularQueuerOptions<any, any>>
  rateLimiter?: Partial<AngularRateLimiterOptions<any, any>>
  throttler?: Partial<AngularThrottlerOptions<any, any>>
}

const DEFAULT_OPTIONS: PacerProviderOptions = {}

export const PACER_OPTIONS = new InjectionToken<PacerProviderOptions>(
  'PACER_OPTIONS',
  {
    providedIn: 'root',
    factory: () => DEFAULT_OPTIONS,
  },
)

export function injectPacerOptions(): PacerProviderOptions {
  try {
    return inject(PACER_OPTIONS, { optional: true }) ?? DEFAULT_OPTIONS
  } catch {
    return DEFAULT_OPTIONS
  }
}
