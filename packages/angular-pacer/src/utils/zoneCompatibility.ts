import { NgZone, inject } from '@angular/core'
import type { AnyFunction } from '@tanstack/pacer'

// Keep NgZone compatibility here so it can be removed independently of signal
// tracking, instance ownership, and PendingTasks support for zoneless apps.

/** Wraps a processing callback to enter Angular's zone when invoked. */
export function injectInsideZone<TFn extends AnyFunction>(fn: TFn): TFn {
  const ngZone = inject(NgZone)
  return ((...args: Parameters<TFn>) => ngZone.run(() => fn(...args))) as TFn
}

/** Runs background scheduling outside Angular's zone. */
export function injectOutsideZone() {
  const ngZone = inject(NgZone)
  return <T>(operation: () => T): T => ngZone.runOutsideAngular(operation)
}
