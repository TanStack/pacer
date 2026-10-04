import { splitSlot, subSlot } from '../utils/slots'
import { useRateLimiter } from './useRateLimiter'
import type {
  OctaneRateLimiter,
  OctaneRateLimiterOptions,
} from './useRateLimiter'
import type { OctanePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as useRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
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
