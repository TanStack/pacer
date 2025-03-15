import { AsyncDebouncer } from '@tanstack/bouncer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/bouncer/async-debouncer'

export function createAsyncDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncDebouncerOptions) {
  return new AsyncDebouncer(fn, options)
}
