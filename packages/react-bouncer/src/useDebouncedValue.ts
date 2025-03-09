import { useEffect, useState } from 'react'
import { useDebouncer } from './useDebouncer'
import type { DebouncerOptions } from '@tanstack/bouncer'

/**
 * Returns a debounced value that is updated with a wait.
 *
 * @param value - The value to debounce.
 * @param options - The options for the debouncer.
 * @returns A tuple containing the debounced value and other debouncer methods.
 */
export function useDebouncedValue<T>(value: T, options: DebouncerOptions) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  const { debounce, cancel, getExecutionCount } = useDebouncer(
    setDebouncedValue,
    options,
  )

  useEffect(() => {
    debounce(value)
    return () => {
      cancel()
    }
  }, [value, options, debounce, cancel])

  return [debouncedValue, { cancel, getExecutionCount }] as const
}
