import { splitSlot, subSlot } from '../utils/slots'
import { useRateLimiter } from './useRateLimiter'
import type {
  OctaneRateLimiter,
  OctaneRateLimiterOptions,
} from './useRateLimiter'
import type { OctanePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable rate-limited callback owned by the Octane lifecycle.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns an accepted-or-rejected boolean.
 *
 * ## State and ownership
 *
 * Use useRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useRateLimitedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useRateLimitedCallback((value: number) => { console.log(value) }, { limit: 3, window: 1000 })
 * schedule(1)
 * ```
 *
 * @see useRateLimiter
 */
export function useRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneRateLimiterOptions<TFn>>,
): OctaneRateLimiter<TFn>['maybeExecute']
export function useRateLimitedCallback<TFn extends AnyFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneRateLimiterOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneRateLimiter<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useRateLimiter<TFn> as (
    ...args: [...Parameters<typeof useRateLimiter<TFn>>, symbol]
  ) => OctaneRateLimiter<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneRateLimiterOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
