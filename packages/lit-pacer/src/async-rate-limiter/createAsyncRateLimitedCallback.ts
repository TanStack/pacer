import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncRateLimiter,
  LitAsyncRateLimiterOptions,
} from './createAsyncRateLimiter'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Lit lifecycle.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A rejected rate-limit call resolves with undefined.
 *
 * ## State and ownership
 *
 * Use createAsyncRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createAsyncRateLimitedCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createAsyncRateLimitedCallback(this, async (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * void schedule(1)
 * ```
 *
 * @see createAsyncRateLimiter
 */
export function createAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncRateLimiterOptions<TFn>>,
): LitAsyncRateLimiter<TFn>['maybeExecute'] {
  return createAsyncRateLimiter(host, fn, options).maybeExecute
}
