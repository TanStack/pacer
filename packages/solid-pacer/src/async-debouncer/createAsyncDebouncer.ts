import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'

export function createAsyncDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncDebouncerOptions) {
  return new AsyncDebouncer(fn, options)
}
