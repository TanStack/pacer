import './helpers/angular'
import { ApplicationRef, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it } from 'vitest'
import { injectAsyncDebouncer } from '../src/async-debouncer/injectAsyncDebouncer'

it('keeps zoneless stability pending until an asynchronous result is applied', async () => {
  let resolve!: (value: string) => void
  const result = signal('loading')
  const response = new Promise<string>((done) => {
    resolve = done
  })
  const loader = TestBed.runInInjectionContext(() =>
    injectAsyncDebouncer(
      async () => {
        result.set(await response)
        return result()
      },
      { wait: 0, leading: true },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  await app.whenStable()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  const execution = loader.maybeExecute()
  const stability = app.whenStable()
  try {
    expect(stable).toBe(false)
  } finally {
    resolve('loaded')
    await execution
    await stability
    subscription.unsubscribe()
  }
  expect(result()).toBe('loaded')
})
