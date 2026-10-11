import { untrack } from 'svelte'

export type SetValue<T> = (value: T | ((previous: T) => T)) => void
export type CellValue<T> = () => T
export type ValueSource<T> = () => T
export function readSource<T>(source: ValueSource<T>): T {
  return source()
}
export function createCell<T>(initial: T) {
  let value = $state.raw(initial)
  const set: SetValue<T> = (next) => {
    value =
      typeof next === 'function' ? (next as (previous: T) => T)(value) : next
  }
  return { value: () => value, set }
}
export function observe<T>(
  source: ValueSource<T>,
  callback: (value: T) => void,
) {
  $effect.pre(() => {
    const value = source()
    untrack(() => callback(value))
  })
}
