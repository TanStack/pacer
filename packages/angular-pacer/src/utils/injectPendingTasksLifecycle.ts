import { PendingTasks, effect, inject, untracked } from '@angular/core'
import { injectInsideZone } from './zoneCompatibility'

/** Tracks pending work and releases its task when the owner is destroyed. */
export function injectPendingTasksLifecycle(
  hasPendingTasks: () => boolean,
): void {
  const pendingTasks = inject(PendingTasks)
  const releaseInZone = injectInsideZone((release: () => void) => release())

  effect((onCleanup) => {
    if (!hasPendingTasks()) return
    const release = untracked(() => pendingTasks.add())
    // Keep the task held while entering the zone to avoid transient stability.
    onCleanup(() => releaseInZone(release))
  })
}
