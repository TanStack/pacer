import { useDebouncer } from './useDebouncer'
import type { VueDebouncer, VueDebouncerOptions } from './useDebouncer'
import type { VuePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as useDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: VuePacerOptions<VueDebouncerOptions<TFn>>,
): VueDebouncer<TFn>['maybeExecute'] {
  return useDebouncer(fn, options).maybeExecute
}
