import { DestroyRef, inject, untracked } from '@angular/core'
import { injectOutsideZone } from './zoneCompatibility'

/** Lazily creates one instance and disposes it with its injection context. */
export function injectLazy<T extends object>(
  factory: () => T,
  cleanup: (instance: T) => void,
): () => T {
  const owner = inject(DestroyRef)
  let destroyed = false
  owner.onDestroy(() => {
    destroyed = true
  })
  const runOutside = injectOutsideZone()
  let instance: T | undefined
  const dispose = (value: T) =>
    runOutside(() => untracked(() => cleanup(value)))

  return () => {
    if (!instance) {
      const created = runOutside(() => untracked(factory))
      instance = created
      // The factory may synchronously destroy its own injection context.
      if (destroyed) {
        dispose(created)
      } else {
        owner.onDestroy(() => dispose(created))
      }
    }
    return instance
  }
}
