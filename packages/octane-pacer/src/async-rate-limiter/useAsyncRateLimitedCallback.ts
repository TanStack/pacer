import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncRateLimiter } from './useAsyncRateLimiter'
import type {
  OctaneAsyncRateLimiter,
  OctaneAsyncRateLimiterOptions,
} from './useAsyncRateLimiter'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable ratelimited callback with the same options and cleanup as useAsyncRateLimiter.
 * Use the constructor instead when you also need selected state or control methods.
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
