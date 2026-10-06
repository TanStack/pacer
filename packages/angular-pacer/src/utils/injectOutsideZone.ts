import { NgZone, inject } from '@angular/core'

/** Keep core timers independent of Angular's zone stability. */
export function injectOutsideZone() {
  const zone = inject(NgZone)
  return <T>(operation: () => T): T => zone.runOutsideAngular(operation)
}
