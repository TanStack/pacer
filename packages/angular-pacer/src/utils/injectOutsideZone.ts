import { NgZone, inject } from '@angular/core'

/** Keep background timers out of Angular's stability tracking. */
export function injectOutsideZone() {
  const ngZone = inject(NgZone)
  return <T>(fn: () => T): T => ngZone.runOutsideAngular(fn)
}
