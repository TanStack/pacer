import { Debouncer } from '@tanstack/bouncer/debouncer'
import type { DebouncerOptions } from '@tanstack/bouncer/debouncer'

export function createDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  return new Debouncer(fn, options)
}
