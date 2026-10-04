import { createDebouncer } from './createDebouncer'
import type { SvelteDebouncer, SvelteDebouncerOptions } from './createDebouncer'
import type { SveltePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: SveltePacerOptions<SvelteDebouncerOptions<TFn>>,
): SvelteDebouncer<TFn>['maybeExecute'] {
  return createDebouncer(fn, options).maybeExecute
}
