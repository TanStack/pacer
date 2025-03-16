import { useState } from 'react'
import { useDebouncer } from './useDebouncer'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

export function useDebouncedState<TValue>(
  value: TValue,
  options: DebouncerOptions,
) {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)

  const debouncer = useDebouncer(setDebouncedValue, options)

  return [debouncedValue, debouncer.maybeExecute, debouncer] as const
}
