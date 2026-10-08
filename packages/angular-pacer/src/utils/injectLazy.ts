import { computed, untracked } from '@angular/core'
import { injectOutsideZone } from './injectOutsideZone'
import type { Signal } from '@angular/core'

export function injectLazy<T>(factory: () => T): Signal<T> {
  const outsideZone = injectOutsideZone()
  return computed(() => outsideZone(() => untracked(factory)))
}
