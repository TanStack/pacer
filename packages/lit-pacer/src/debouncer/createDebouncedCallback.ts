import { createDebouncer } from './createDebouncer'
import type { ReactiveControllerHost } from 'lit'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { LitPacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createDebouncedCallback<TFn extends AnyFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitDebouncerOptions<TFn>>,
): LitDebouncer<TFn>['maybeExecute'] {
  return createDebouncer(host, fn, options).maybeExecute
}
