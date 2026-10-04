import { createRateLimiter } from './createRateLimiter'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineRateLimiter,
  AlpineRateLimiterOptions,
} from './createRateLimiter'
import type { AlpinePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Alpine lifecycle.
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
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createRateLimitedCallback } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const schedule = createRateLimitedCallback(scope, (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * schedule(1)
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedCallback<TFn extends AnyFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineRateLimiterOptions<TFn>>,
): AlpineRateLimiter<TFn>['maybeExecute'] {
  return createRateLimiter(scope, fn, options).maybeExecute
}
