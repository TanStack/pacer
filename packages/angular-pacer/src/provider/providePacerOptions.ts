import { InjectionToken, inject } from '@angular/core'
import type { Provider } from '@angular/core'
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

/**
 * Scoped default options for synchronous and asynchronous Pacer adapters.
 * Local utility options override these defaults.
 */
export interface PacerProviderOptions {
  /** Default options for {@link injectAsyncBatcher}. */
  asyncBatcher?: Partial<AngularAsyncBatcherOptions<any>>
  /** Default options for {@link injectAsyncDebouncer}. */
  asyncDebouncer?: Partial<AngularAsyncDebouncerOptions<any>>
  /** Default options for {@link injectAsyncQueuer}. */
  asyncQueuer?: Partial<AngularAsyncQueuerOptions<any>>
  /** Default options for {@link injectAsyncRateLimiter}. */
  asyncRateLimiter?: Partial<AngularAsyncRateLimiterOptions<any>>
  /** Default options for {@link injectAsyncThrottler}. */
  asyncThrottler?: Partial<AngularAsyncThrottlerOptions<any>>
  /** Default options for {@link injectBatcher}. */
  batcher?: Partial<AngularBatcherOptions<any>>
  /** Default options for {@link injectDebouncer}. */
  debouncer?: Partial<AngularDebouncerOptions<any>>
  /** Default options for {@link injectQueuer}. */
  queuer?: Partial<AngularQueuerOptions<any>>
  /** Default options for {@link injectRateLimiter}. */
  rateLimiter?: Partial<AngularRateLimiterOptions<any>>
  /** Default options for {@link injectThrottler}. */
  throttler?: Partial<AngularThrottlerOptions<any>>
}

const PACER_OPTIONS = new InjectionToken<PacerProviderOptions>(
  'TANSTACK_PACER_OPTIONS',
  {
    factory: () => ({}),
  },
)

/**
 * Provides scoped defaults for Angular Pacer utilities.
 *
 * Place this provider in application, route, or component providers. The nearest
 * provider supplies the defaults; local utility options take precedence. A nested
 * provider replaces the outer defaults rather than merging scopes.
 *
 * @param options Partial default options grouped by utility.
 * @returns An Angular provider for the supplied defaults.
 *
 * @example
 * ```ts
 * const appConfig = {
 *   providers: [
 *     providePacerOptions({ debouncer: { wait: 250 } }),
 *   ],
 * }
 * ```
 */
export function providePacerOptions(options: PacerProviderOptions): Provider {
  return {
    provide: PACER_OPTIONS,
    useValue: options,
  }
}

/**
 * Reads the nearest Pacer options provider in the current injection context.
 * Returns an empty object when no provider is configured.
 * @returns The scoped default options.
 */
export function injectPacerOptions(): PacerProviderOptions {
  return inject(PACER_OPTIONS)
}
