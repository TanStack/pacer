import { ContextConsumer, ContextProvider, createContext } from '@lit/context'
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

const pacerContext = createContext<PacerProviderOptions>(
  Symbol.for('@tanstack/lit-pacer/defaults'),
)
const defaults = new WeakMap<
  ReactiveControllerHost,
  () => PacerProviderOptions
>()
const inherited = new WeakMap<
  ReactiveControllerHost,
  () => PacerProviderOptions
>()

/**
 * Supplies reactive defaults for this host and its descendants, including across
 * shadow roots. Call during construction, before creating utilities. The nearest
 * provider wins, and each utility's local options override provider defaults.
 *
 * @example
 * ```ts
 * constructor() {
 *   super()
 *   providePacerOptions(this, () => ({
 *     debouncer: { leading: this.leading },
 *   }))
 * }
 * ```
 */
export function providePacerOptions(
  host: ReactiveControllerHost,
  options: LitPacerOptions<PacerProviderOptions>,
) {
  const read = () => (typeof options === 'function' ? options() : options)
  defaults.set(host, read)
  // Controller-only hosts still support local defaults. DOM hosts also provide
  // the same values through Lit's context protocol to descendant components.
  if (!('dispatchEvent' in host)) return
  const provider = new ContextProvider(
    host as ReactiveControllerHost & HTMLElement,
    {
      context: pacerContext,
      initialValue: read(),
    },
  )
  host.addController({
    hostUpdate() {
      provider.setValue(read(), true)
    },
  })
}

/** Reads local or inherited defaults and refreshes the host when its provider updates. */
export function useDefaultPacerOptions(
  host: ReactiveControllerHost,
): () => PacerProviderOptions {
  let readInherited = inherited.get(host)
  if (!readInherited) {
    let value: PacerProviderOptions = {}
    readInherited = () => value
    inherited.set(host, readInherited)
    if ('dispatchEvent' in host) {
      new ContextConsumer(host as ReactiveControllerHost & HTMLElement, {
        context: pacerContext,
        subscribe: true,
        callback(next) {
          value = next
          host.requestUpdate()
        },
      })
    }
  }
  return () => defaults.get(host)?.() ?? readInherited()
}
