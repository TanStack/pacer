import { createRateLimiter } from './createRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { LitPacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Lit lifecycle.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns an accepted-or-rejected boolean.
 *
 * ## State and ownership
 *
 * Use createRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createRateLimitedCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createRateLimitedCallback(this, (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * schedule(1)
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitRateLimiterOptions<TFn>>,
): LitRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(host, fn, options).maybeExecute
}
