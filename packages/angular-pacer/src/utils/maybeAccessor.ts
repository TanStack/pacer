import { computed } from '@angular/core'

import type { NonCallable } from './internalTypes'

export type MaybeAccessor<T> = NonCallable<T> | (() => T)

function isAccessor<T>(value: MaybeAccessor<T>): value is () => T {
  return typeof value === 'function'
}

export function toAccessorSignal<T>(maybeAccesor: MaybeAccessor<T>) {
  return computed(() =>
    isAccessor(maybeAccesor) ? maybeAccesor() : maybeAccesor,
  )
}
