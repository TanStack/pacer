import { createMemo } from 'solid-js'
import { Debouncer } from '@tanstack/bouncer/debouncer'
import type { DebouncerOptions } from '@tanstack/bouncer/debouncer'

export function createDebouncer<
  TFn extends (...args: Array<any>) => any,
  _TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncer = createMemo(() => new Debouncer(fn, options))

  return {
    maybeExecute: debouncer().maybeExecute.bind(debouncer()),
    cancel: debouncer().cancel.bind(debouncer()),
    getExecutionCount: debouncer().getExecutionCount.bind(debouncer()),
  } as const
}
