import { useRef } from 'react'
import { Debouncer } from '@tanstack/pacer/debouncer'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

export function useDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncerRef = useRef<Debouncer<TFn, TArgs>>(null)

  if (!debouncerRef.current) {
    debouncerRef.current = new Debouncer(fn, options)
  }

  return {
    maybeExecute: debouncerRef.current.maybeExecute.bind(debouncerRef.current),
    cancel: debouncerRef.current.cancel.bind(debouncerRef.current),
    getExecutionCount: debouncerRef.current.getExecutionCount.bind(
      debouncerRef.current,
    ),
  } as const
}
