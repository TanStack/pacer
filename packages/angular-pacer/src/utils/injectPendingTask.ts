import { DestroyRef, PendingTasks, inject, untracked } from '@angular/core'

/** Own scheduled work and individual executions for the injection context. */
export function injectPendingTask() {
  const owner = inject(DestroyRef)
  const tasks = inject(PendingTasks)
  let release: (() => void) | undefined
  const set = (pending: boolean) =>
    untracked(() => {
      if (pending) {
        if (!release && !owner.destroyed) release = tasks.add()
        return
      }
      const cleanup = release
      release = undefined
      cleanup?.()
    })
  owner.onDestroy(() => set(false))
  return {
    set,
    async run<T>(operation: () => T | PromiseLike<T>): Promise<T> {
      if (owner.destroyed) return untracked(operation)
      const releaseRun = tasks.add()
      const unregister = owner.onDestroy(releaseRun)
      try {
        return await untracked(operation)
      } finally {
        unregister()
        releaseRun()
      }
    },
  }
}
