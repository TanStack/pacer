import { useEffect } from 'react'
import { useDebouncedState } from './useDebouncedState'
import type { DebouncerOptions } from '@tanstack/bouncer/debouncer'

export function useDebouncedValue<TValue>(
  value: TValue,
  options: DebouncerOptions,
) {
  const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedState(
    value,
    options,
  )

  useEffect(() => {
    setDebouncedValue(value)
    return () => {
      debouncer.cancel()
    }
  }, [value, setDebouncedValue, debouncer])

  return [debouncedValue, debouncer] as const
}
