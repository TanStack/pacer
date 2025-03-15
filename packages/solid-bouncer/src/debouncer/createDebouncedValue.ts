import { createEffect } from 'solid-js'
import { createDebouncedSignal } from './createDebouncedSignal'
import type { DebouncerOptions } from '@tanstack/bouncer/debouncer'

export function createDebouncedValue<TValue>(
  value: TValue,
  options: DebouncerOptions,
) {
  const [debouncedValue, setDebouncedValue, debouncer] = createDebouncedSignal(
    value,
    options,
  )

  createEffect(() => {
    setDebouncedValue(() => value)
    return () => {
      debouncer.cancel()
    }
  })

  return [debouncedValue, debouncer] as const
}
