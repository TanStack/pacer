import { createSignal } from 'solid-js'
import { createDebouncer } from './createDebouncer'
import type { DebouncerOptions } from '@tanstack/bouncer/debouncer'

export function createDebouncedSignal<TValue>(
  value: TValue,
  options: DebouncerOptions,
) {
  const [debouncedValue, setDebouncedValue] = createSignal<TValue>(value)

  const debouncer = createDebouncer(setDebouncedValue, options)

  return [debouncedValue, debouncer.maybeExecute, debouncer] as const
}
