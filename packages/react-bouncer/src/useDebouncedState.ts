import { useState } from 'react'
import { useDebouncer } from './useDebouncer'
import type { DebouncerOptions } from '@tanstack/bouncer'

export function useDebouncedState<T>(value: T, options: DebouncerOptions) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  const {
    debounce: debouncedSetValue,
    cancel,
    getExecutionCount,
  } = useDebouncer(setDebouncedValue, options)

  return [
    debouncedValue,
    debouncedSetValue,
    { cancel, getExecutionCount },
  ] as const
}
