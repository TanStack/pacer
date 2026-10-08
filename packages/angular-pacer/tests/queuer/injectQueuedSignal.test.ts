import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectQueuedSignal } from '../../src/queuer/injectQueuedSignal'

it('returns an editable Angular signal with selected queue state', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal(0, { started: false }, (state) => state.size),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expectTypeOf(value.queuer.state()).toEqualTypeOf<number>()
  TestBed.tick()
  expect(value.queuer.state()).toBe(0)
  value.set(1)
  expect(value()).toBe(0)
  expect(value.queuer.state()).toBe(1)
  value.queuer.execute()
  expect(value()).toBe(1)
})

it('processes every set and update in FIFO order against the committed value', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal(0, { started: false }),
  )
  const firstUpdate = vi.fn((previous: number) => previous + 2)
  const secondUpdate = vi.fn((previous: number) => previous * 2)
  TestBed.tick()
  value.set(1)
  value.update(firstUpdate)
  value.update(secondUpdate)
  expect(value()).toBe(0)
  expect(firstUpdate).not.toHaveBeenCalled()
  expect(secondUpdate).not.toHaveBeenCalled()
  value.queuer.execute()
  expect(value()).toBe(1)
  value.queuer.execute()
  expect(value()).toBe(3)
  expect(firstUpdate).toHaveBeenCalledExactlyOnceWith(1)
  value.queuer.execute()
  expect(value()).toBe(6)
  expect(secondUpdate).toHaveBeenCalledExactlyOnceWith(3)
})

it('paces accepted writes rather than replacing them with the latest value', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal(0, { wait: 100 }),
  )
  TestBed.tick()
  value.set(1)
  value.set(2)
  value.update((previous) => previous + 3)
  expect(value()).toBe(1)
  vi.advanceTimersByTime(99)
  expect(value()).toBe(1)
  vi.advanceTimersByTime(1)
  expect(value()).toBe(2)
  vi.advanceTimersByTime(100)
  expect(value()).toBe(5)
})

it('does not apply cleared writes or evaluate their updaters', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal(0, { started: false }),
  )
  const update = vi.fn((previous: number) => previous + 1)
  TestBed.tick()
  value.set(10)
  value.update(update)
  value.queuer.clear()
  value.queuer.flush()
  expect(value()).toBe(0)
  expect(update).not.toHaveBeenCalled()
})
