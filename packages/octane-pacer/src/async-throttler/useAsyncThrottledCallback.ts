import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncThrottler } from './useAsyncThrottler'
import type {
  OctaneAsyncThrottler,
  OctaneAsyncThrottlerOptions,
} from './useAsyncThrottler'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as useAsyncThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
): OctaneAsyncThrottler<TFn>['maybeExecute']
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneAsyncThrottler<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncThrottler<TFn> as (
    ...args: [...Parameters<typeof useAsyncThrottler<TFn>>, symbol]
  ) => OctaneAsyncThrottler<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
