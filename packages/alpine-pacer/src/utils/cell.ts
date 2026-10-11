import Alpine from 'alpinejs'
import type { PacerScope } from '../provider/PacerProvider'

export type SetValue<T> = (value: T | ((previous: T) => T)) => void
export type CellValue<T> = () => T
export type ValueSource<T> = () => T
export function readSource<T>(source: ValueSource<T>): T {
  return source()
}
export function createCell<T>(scope: PacerScope, initial: T) {
  scope.assertActive()
  const state = Alpine.reactive({ value: initial })
  const set: SetValue<T> = (next) => {
    state.value =
      typeof next === 'function'
        ? (next as (previous: T) => T)(state.value)
        : next
  }
  return { value: () => state.value, set }
}
export function observe<T>(
  scope: PacerScope,
  source: ValueSource<T>,
  callback: (value: T) => void,
) {
  scope.effect(() => {
    const value = source()
    queueMicrotask(() => {
      if (!scope.destroyed) callback(value)
    })
  })
}
