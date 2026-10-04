import { useAsyncRateLimiter } from './useAsyncRateLimiter'
import type {
  VueAsyncRateLimiter,
  VueAsyncRateLimiterOptions,
} from './useAsyncRateLimiter'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Vue lifecycle.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A rejected rate-limit call resolves with undefined.
 *
 * ## State and ownership
 *
 * Use useAsyncRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncRateLimitedCallback } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const schedule = useAsyncRateLimitedCallback(async (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncRateLimiter
 */
export function useAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncRateLimiterOptions<TFn>>,
): VueAsyncRateLimiter<TFn>['maybeExecute'] {
  return useAsyncRateLimiter(fn, options).maybeExecute
}
