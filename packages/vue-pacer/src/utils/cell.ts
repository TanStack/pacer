import { shallowReadonly, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'

export type SetValue<T> = (value: T | ((previous: T) => T)) => void
export type CellValue<T> = Readonly<ShallowRef<T>>
export type ValueSource<T> = MaybeRefOrGetter<T>
export const readSource = toValue
export function createCell<T>(initial: T) {
  const value = shallowRef(initial)
  const set: SetValue<T> = (next) => {
    value.value =
      typeof next === 'function'
        ? (next as (previous: T) => T)(value.value)
        : next
  }
  return { value: shallowReadonly(value) as CellValue<T>, set }
}
export function observe<T>(
  source: ValueSource<T>,
  callback: (value: T) => void,
) {
  watch(() => toValue(source), callback, { immediate: true, flush: 'sync' })
}
