import { ApplicationRef, DestroyRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'

export function injectTestStability() {
  const app = TestBed.inject(ApplicationRef)
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  TestBed.inject(DestroyRef).onDestroy(() => {
    subscription.unsubscribe()
  })

  return {
    whenStable: () => app.whenStable(),
    get isStable() {
      return stable
    },
  }
}
