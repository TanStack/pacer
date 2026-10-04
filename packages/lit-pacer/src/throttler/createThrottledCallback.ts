import { createThrottler } from './createThrottler'
import type { ReactiveControllerHost } from 'lit'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { LitPacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback owned by the Lit lifecycle.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use createThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createThrottledCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createThrottledCallback(this, (value: number) => { console.log(value) }, { wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createThrottler
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitThrottlerOptions<TFn>>,
): LitThrottler<TFn>['maybeExecute'] {
  return createThrottler(host, fn, options).maybeExecute
}
