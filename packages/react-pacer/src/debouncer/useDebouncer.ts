import { useRef } from 'react'
import { Debouncer } from '@tanstack/pacer/debouncer'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

export function useDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncer = useRef<Debouncer<TFn, TArgs>>(null)

  if (!debouncer.current) {
    debouncer.current = new Debouncer(fn, options)
  }

  return {
    maybeExecute: debouncer.current.maybeExecute.bind(debouncer.current),
    cancel: debouncer.current.cancel.bind(debouncer.current),
    getExecutionCount: debouncer.current.getExecutionCount.bind(
      debouncer.current,
    ),
  } as const
}
