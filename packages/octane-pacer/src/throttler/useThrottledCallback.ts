import { splitSlot, subSlot } from '../utils/slots'
import { useThrottler } from './useThrottler'
import type { OctaneThrottler, OctaneThrottlerOptions } from './useThrottler'
import type { OctanePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as useThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneThrottlerOptions<TFn>>,
): OctaneThrottler<TFn>['maybeExecute']
export function useThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneThrottlerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneThrottler<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useThrottler<TFn> as (
    ...args: [...Parameters<typeof useThrottler<TFn>>, symbol]
  ) => OctaneThrottler<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneThrottlerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
