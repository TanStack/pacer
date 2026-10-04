import { createThrottler } from './createThrottler'
import type { SvelteThrottler, SvelteThrottlerOptions } from './createThrottler'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteThrottlerOptions<TFn>>,
): SvelteThrottler<TFn>['maybeExecute'] {
  return createThrottler(fn, options).maybeExecute
}
