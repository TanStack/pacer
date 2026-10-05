import Alpine from 'alpinejs'
import type { AlpinePacerOptions } from '../types'
import type { AlpineAsyncBatcherOptions } from '../async-batcher/createAsyncBatcher'
import type { AlpineAsyncDebouncerOptions } from '../async-debouncer/createAsyncDebouncer'
import type { AlpineAsyncQueuerOptions } from '../async-queuer/createAsyncQueuer'
import type { AlpineAsyncRateLimiterOptions } from '../async-rate-limiter/createAsyncRateLimiter'
import type { AlpineAsyncThrottlerOptions } from '../async-throttler/createAsyncThrottler'
import type { AlpineBatcherOptions } from '../batcher/createBatcher'
import type { AlpineDebouncerOptions } from '../debouncer/createDebouncer'
import type { AlpineQueuerOptions } from '../queuer/createQueuer'
import type { AlpineRateLimiterOptions } from '../rate-limiter/createRateLimiter'
import type { AlpineThrottlerOptions } from '../throttler/createThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<AlpineAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<AlpineAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<AlpineAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<AlpineAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<AlpineAsyncThrottlerOptions<any, any>>
  batcher?: Partial<AlpineBatcherOptions<any, any>>
  debouncer?: Partial<AlpineDebouncerOptions<any, any>>
  queuer?: Partial<AlpineQueuerOptions<any, any>>
  rateLimiter?: Partial<AlpineRateLimiterOptions<any, any>>
  throttler?: Partial<AlpineThrottlerOptions<any, any>>
}

/** Lifecycle and reactive defaults owned by an Alpine component or element. */
export interface PacerScope {
  defaultOptions: () => PacerProviderOptions
  effect: (callback: () => void) => void
  addCleanup: (cleanup: () => void) => void
  assertActive: () => void
  readonly destroyed: boolean
  destroy: () => void
}

/** Creates a lifecycle scope. Call destroy from Alpine's destroy hook when used manually. */
export function createScope(
  defaultOptions: AlpinePacerOptions<PacerProviderOptions> = {},
): PacerScope {
  let destroyed = false
  const cleanups = new Set<() => void>()
  const assertActive = () => {
    if (destroyed) throw new Error('Cannot use a destroyed Pacer scope')
  }
  return {
    defaultOptions: () =>
      typeof defaultOptions === 'function' ? defaultOptions() : defaultOptions,
    assertActive,
    effect(callback) {
      assertActive()
      const runner = Alpine.effect(() => {
        if (!destroyed) callback()
      })
      cleanups.add(() => Alpine.release(runner))
    },
    addCleanup(cleanup) {
      assertActive()
      cleanups.add(cleanup)
    },
    get destroyed() {
      return destroyed
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      try {
        for (const cleanup of [...cleanups].reverse()) cleanup()
      } finally {
        cleanups.clear()
      }
    },
  }
}
