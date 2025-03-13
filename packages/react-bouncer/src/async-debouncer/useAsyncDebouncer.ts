import { useRef } from 'react'
import { AsyncDebouncer } from '@tanstack/bouncer/async-debouncer'
import type { AsyncDebouncerOptions } from '@tanstack/bouncer/async-debouncer'

export function useAsyncDebouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: AsyncDebouncerOptions) {
  const asyncDebouncerRef = useRef<AsyncDebouncer<TFn, TArgs>>(null)

  if (!asyncDebouncerRef.current) {
    asyncDebouncerRef.current = new AsyncDebouncer(fn, options)
  }

  return {
    maybeExecute: asyncDebouncerRef.current.maybeExecute.bind(
      asyncDebouncerRef.current,
    ),
    cancel: asyncDebouncerRef.current.cancel.bind(asyncDebouncerRef.current),
    getExecutionCount: asyncDebouncerRef.current.getExecutionCount.bind(
      asyncDebouncerRef.current,
    ),
  } as const
}
