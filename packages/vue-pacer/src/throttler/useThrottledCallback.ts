import { useThrottler } from './useThrottler'
import type { VueThrottler, VueThrottlerOptions } from './useThrottler'
import type { VuePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as useThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: VuePacerOptions<VueThrottlerOptions<TFn>>,
): VueThrottler<TFn>['maybeExecute'] {
  return useThrottler(fn, options).maybeExecute
}
