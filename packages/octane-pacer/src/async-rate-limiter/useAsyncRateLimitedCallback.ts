import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncRateLimiter } from './useAsyncRateLimiter'
import type {
  OctaneAsyncRateLimiter,
  OctaneAsyncRateLimiterOptions,
} from './useAsyncRateLimiter'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Octane lifecycle.
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
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncRateLimitedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useAsyncRateLimitedCallback(async (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncRateLimiter
 */
export function useAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncRateLimiterOptions<TFn>>,
): OctaneAsyncRateLimiter<TFn>['maybeExecute']
export function useAsyncRateLimitedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncRateLimiterOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneAsyncRateLimiter<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncRateLimiter<TFn> as (
    ...args: [...Parameters<typeof useAsyncRateLimiter<TFn>>, symbol]
  ) => OctaneAsyncRateLimiter<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncRateLimiterOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
