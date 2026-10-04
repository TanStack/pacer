import { useAsyncDebouncer } from './useAsyncDebouncer'
import type {
  VueAsyncDebouncer,
  VueAsyncDebouncerOptions,
} from './useAsyncDebouncer'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as useAsyncDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncDebouncerOptions<TFn>>,
): VueAsyncDebouncer<TFn>['maybeExecute'] {
  return useAsyncDebouncer(fn, options).maybeExecute
}
