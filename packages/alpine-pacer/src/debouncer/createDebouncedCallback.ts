import { createDebouncer } from './createDebouncer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { AlpinePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as createDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function createDebouncedCallback<TFn extends AnyFunction>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineDebouncerOptions<TFn>>,
): AlpineDebouncer<TFn>['maybeExecute'] {
  return createDebouncer(scope, fn, options).maybeExecute
}
