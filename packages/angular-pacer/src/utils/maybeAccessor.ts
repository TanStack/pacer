import { computed } from '@angular/core'

export type MaybeAccessor<T> = T | (() => T)

function isAccessor<T>(value: MaybeAccessor<T>): value is () => T {
  return typeof value === 'function'
}

export function toAccessorSignal<T>(maybeAccesor: MaybeAccessor<T>) {
  return computed(() =>
    isAccessor(maybeAccesor) ? maybeAccesor() : maybeAccesor,
  )
}
