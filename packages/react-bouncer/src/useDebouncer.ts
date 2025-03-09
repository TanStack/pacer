import { Debouncer } from '@tanstack/bouncer'
import { useRef } from 'react'
import type { DebouncerOptions } from '@tanstack/bouncer'

export function useDebouncer(
  fn: (...args: Array<any>) => void,
  options: DebouncerOptions,
) {
  const debouncerRef = useRef<Debouncer<typeof fn>>(null)

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
