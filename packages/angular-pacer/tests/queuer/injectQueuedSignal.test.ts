import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectQueuedSignal } from '../../src/queuer/injectQueuedSignal'
import type { Signal, WritableSignal } from '@angular/core'

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

it('implements the writable signal contract with a live readonly view', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal(0, { started: false }),
  )
  expectTypeOf(value).toExtend<WritableSignal<number>>()
  expectTypeOf(value.set).parameters.toEqualTypeOf<[number]>()
  expectTypeOf(value.update).parameters.toEqualTypeOf<
    [(value: number) => number]
  >()
  const readonlyValue = value.asReadonly()
  expectTypeOf(readonlyValue).toEqualTypeOf<Signal<number>>()
  expect(isSignal(readonlyValue)).toBe(true)
  expect(readonlyValue).toBe(value.asReadonly())
  expect(readonlyValue).not.toHaveProperty('set')
  expect(readonlyValue).not.toHaveProperty('update')
  expect(readonlyValue()).toBe(0)
  TestBed.tick()
  value.set(1)
  value.queuer.execute()
  expect(readonlyValue()).toBe(1)
})

it('preserves function values through set and requires raw writes to return them', () => {
  const fn = () => 1
  const replacement = vi.fn(() => 2)
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal<typeof fn>(() => fn, {
      started: false,
      initialItems: [() => fn],
    }),
  )
  TestBed.tick()
  value.queuer.execute()
  expect(value()).toBe(fn)
  value.set(replacement)
  value.queuer.execute()
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()
  value.update(() => fn)
  value.queuer.execute()
  expect(value()).toBe(fn)

  // @ts-expect-error Raw utility functions must return a value of the signal's type.
  void (() => value.queuer.addItem(() => 2))
  value.queuer.addItem(() => replacement)
  value.queuer.execute()
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()

  void (() =>
    injectQueuedSignal<typeof fn>(() => fn, {
      started: false,
      // @ts-expect-error Initial queue functions must return a value of the signal's type.
      initialItems: [() => 2],
    }))
})

it('stores constructor values through set without treating them as updaters', () => {
  class Initial {}
  class Replacement {}
  const value = TestBed.runInInjectionContext(() =>
    injectQueuedSignal<typeof Initial>(() => Initial, { started: false }),
  )
  TestBed.tick()
  value.set(Replacement)
  value.queuer.execute()
  expect(value()).toBe(Replacement)

  // @ts-expect-error Constructor values must be wrapped when passed to raw controls.
  void (() => value.queuer.addItem(Replacement))
  void (() =>
    injectQueuedSignal<typeof Initial>(() => Initial, {
      started: false,
      // @ts-expect-error Constructor values must be wrapped in initial queue items.
      initialItems: [Replacement],
    }))
})
