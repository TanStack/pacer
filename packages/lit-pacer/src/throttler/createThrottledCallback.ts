import { createThrottler } from './createThrottler'
import type { ReactiveControllerHost } from 'lit'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { LitPacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback with the same options and cleanup as createThrottler.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createThrottledCallback<TFn extends AnyFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitThrottlerOptions<TFn>>,
): LitThrottler<TFn>['maybeExecute'] {
  return createThrottler(host, fn, options).maybeExecute
}
