import { createThrottler } from './createThrottler'
import type { SvelteThrottler, SvelteThrottlerOptions } from './createThrottler'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback owned by the Svelte lifecycle.
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
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createThrottledCallback } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const schedule = createThrottledCallback((value: number) => { console.log(value) }, { wait: 500 })
 * schedule(1)
 * ```
 *
 * @see createThrottler
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteThrottlerOptions<TFn>>,
): SvelteThrottler<TFn>['maybeExecute'] {
  return createThrottler(fn, options).maybeExecute
}
