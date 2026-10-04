import { createRateLimiter } from './createRateLimiter'
import type {
  SvelteRateLimiter,
  SvelteRateLimiterOptions,
} from './createRateLimiter'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Svelte lifecycle.
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
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createRateLimitedCallback } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const schedule = createRateLimitedCallback((value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * schedule(1)
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteRateLimiterOptions<TFn>>,
): SvelteRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(fn, options).maybeExecute
}
