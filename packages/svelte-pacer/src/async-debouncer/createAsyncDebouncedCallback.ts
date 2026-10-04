import { createAsyncDebouncer } from './createAsyncDebouncer'
import type {
  SvelteAsyncDebouncer,
  SvelteAsyncDebouncerOptions,
} from './createAsyncDebouncer'
import type { SveltePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createAsyncDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncDebouncerOptions<TFn>>,
): SvelteAsyncDebouncer<TFn>['maybeExecute'] {
  return createAsyncDebouncer(fn, options).maybeExecute
}
