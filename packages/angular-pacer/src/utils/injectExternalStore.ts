import {
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core'
import { injectOutsideZone } from './injectOutsideZone'
import type { Signal } from '@angular/core'

interface ExternalBinding<T> {
  getSnapshot: () => T
  subscribe: (notify: () => void) => () => void
}

/** Notifications invalidate; tracked reads run selectors. The effect owns observation. */
export function injectExternalStore<T>(
  binding: () => ExternalBinding<T>,
): Signal<T> {
  const owner = inject(DestroyRef)
  const outsideZone = injectOutsideZone()
  const revision = signal(0)
  const requested = computed(() => outsideZone(binding))
  const invalidate = () =>
    untracked(() => revision.update((value) => value + 1))
  effect((onCleanup) => {
    if (owner.destroyed) return
    const current = requested()
    outsideZone(() =>
      untracked(() => {
        try {
          const unsubscribe = current.subscribe(invalidate)
          if (owner.destroyed) unsubscribe()
          else onCleanup(() => outsideZone(unsubscribe))
        } finally {
          // Close the gap between an early read and subscription setup.
          invalidate()
        }
      }),
    )
  })
  return computed(() => {
    revision()
    return outsideZone(() => requested().getSnapshot())
  })
}
