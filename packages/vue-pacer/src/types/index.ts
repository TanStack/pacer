import type { Ref } from 'vue'
import type { Debouncer } from '@tanstack/pacer/debouncer'

export type VueDebouncer<TValue> = Debouncer<(value: TValue) => void> & {
  readonly value: TValue
}

export type MaybeRef<T> = T | Ref<T>
export type MaybeRefOrGetter<T> = MaybeRef<T> | (() => T)
export type UnwrapRef<T> = T extends Ref<infer U> ? U : T
export type UnwrapMaybeRef<T> = T extends Ref<infer U> ? U : T
