import { createSignal } from 'solid-js'
import { createDebouncer } from './createDebouncer'
import type { DebouncerOptions } from '../../../pacer/dist/esm/debouncer'

export function createDebouncedSignal<TValue>(
  value: TValue,
  options: DebouncerOptions,
) {
  const [debouncedValue, setDebouncedValue] = createSignal<TValue>(value)

  const debouncer = createDebouncer(
    (value: TValue | ((prev: TValue) => TValue)) => {
      if (typeof value === 'function') {
        setDebouncedValue(value as (prev: TValue) => TValue)
      } else {
        setDebouncedValue(() => value)
      }
    },
    options,
  )

  return [debouncedValue, debouncer.maybeExecute, debouncer] as const
}
