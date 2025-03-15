import { createMemo } from 'solid-js'
import { AsyncDebouncer } from '@tanstack/bouncer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/bouncer/async-debouncer'

export function createAsyncDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncDebouncerOptions) {
  const asyncDebouncer = createMemo(() => new AsyncDebouncer(fn, options))

  return {
    maybeExecute: asyncDebouncer().maybeExecute.bind(asyncDebouncer()),
    cancel: asyncDebouncer().cancel.bind(asyncDebouncer()),
    getExecutionCount: asyncDebouncer().getExecutionCount.bind(asyncDebouncer()),
  } as const
}
