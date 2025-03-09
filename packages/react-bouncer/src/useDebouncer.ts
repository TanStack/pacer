import { Debouncer } from '@tanstack/bouncer'
import { useRef } from 'react'
import type { DebouncerOptions } from '@tanstack/bouncer'

export function useDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncerRef = useRef<Debouncer<TFn, TArgs>>(null)

  if (!debouncerRef.current) {
    debouncerRef.current = new Debouncer(fn, options)
  }

  return {
    debounce: debouncerRef.current.execute.bind(debouncerRef.current),
    cancel: debouncerRef.current.cancel.bind(debouncerRef.current),
    getExecutionCount: debouncerRef.current.getExecutionCount.bind(
      debouncerRef.current,
    ),
  } as const
}
