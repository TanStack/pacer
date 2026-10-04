import { createThrottler } from './createThrottler'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineThrottler, AlpineThrottlerOptions } from './createThrottler'
import type { AlpinePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineThrottlerOptions<TFn>>,
): AlpineThrottler<TFn>['maybeExecute'] {
  return createThrottler(scope, fn, options).maybeExecute
}
