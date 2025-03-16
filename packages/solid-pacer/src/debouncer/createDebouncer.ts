import { Debouncer } from '../../../pacer/dist/esm/debouncer'
import type { DebouncerOptions } from '../../../pacer/dist/esm/debouncer'

export function createDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  return new Debouncer(fn, options)
}
