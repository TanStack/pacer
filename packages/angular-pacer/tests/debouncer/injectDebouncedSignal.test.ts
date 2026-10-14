import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectDebouncedSignal } from '../../src/debouncer/injectDebouncedSignal'
import type { Signal, WritableSignal } from '@angular/core'

it('returns an Angular signal with the debouncer as an attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(0, { wait: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expect(value()).toBe(0)
  expect(value).toHaveProperty('debouncer')
  TestBed.tick()
  value.debouncer.maybeExecute(1)
  expect(value()).toBe(0)
  value.debouncer.flush()
  expect(value()).toBe(1)
})

it('debounces set calls until the delay after the latest value', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal('initial', { wait: 100 }),
  )
  TestBed.tick()

  value.set('first')
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(60)
  expect(value()).toBe('initial')

  value.set('latest')
  vi.advanceTimersByTime(40)
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(59)
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(1)
  expect(value()).toBe('latest')
})

it('debounces update calls and applies only the latest callback to the current value', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(10, { wait: 100 }),
  )
  const first = vi.fn((previous: number) => previous + 1)
  const latest = vi.fn((previous: number) => previous * 2)
  TestBed.tick()

  value.update(first)
  vi.advanceTimersByTime(60)
  value.update(latest)
  expect(value()).toBe(10)
  expect(first).not.toHaveBeenCalled()
  expect(latest).not.toHaveBeenCalled()

  vi.advanceTimersByTime(99)
  expect(value()).toBe(10)
  expect(latest).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(value()).toBe(20)
  expect(first).not.toHaveBeenCalled()
  expect(latest).toHaveBeenCalledExactlyOnceWith(10)
})

it('supports set followed by update using the current committed value', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(0, { wait: 100 }),
  )
  const update = vi.fn((previous: number) => previous + 5)
  TestBed.tick()

  value.set(10)
  vi.advanceTimersByTime(99)
  expect(value()).toBe(0)
  vi.advanceTimersByTime(1)
  expect(value()).toBe(10)

  value.update(update)
  vi.advanceTimersByTime(99)
  expect(value()).toBe(10)
  expect(update).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(update).toHaveBeenCalledExactlyOnceWith(10)
  expect(value()).toBe(15)

  value.set(2)
  vi.advanceTimersByTime(100)
  expect(value()).toBe(2)
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal('initial', { wait: 100 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.debouncer.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  value.debouncer.flush()
  const before = value.debouncer.state().count
  value.set('updated')
  value.debouncer.flush()
  expect(value()).toBe('updated')
  expect(value.debouncer.state().count).toBe(before + 1)
})

it('preserves a function-valued initial value supplied through a factory', () => {
  const fn = (n: number) => n + 1
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal<typeof fn>(() => fn, { wait: 10 }),
  )
  expectTypeOf(value()).toEqualTypeOf<typeof fn>()
  expect(value()).toBe(fn)
  expect(value()(2)).toBe(3)
  TestBed.tick()
  const replacement = vi.fn((n: number) => n * 2)
  value.set(replacement)
  value.debouncer.flush()
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()
  value.update(() => fn)
  value.debouncer.flush()
  expect(value()).toBe(fn)

  // @ts-expect-error Raw utility functions must return a value of the signal's type.
  void (() => value.debouncer.maybeExecute(() => 2))
  value.debouncer.maybeExecute(() => replacement)
  value.debouncer.flush()
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()

  // @ts-expect-error Function values must be wrapped to distinguish them from accessors.
  void (() => injectDebouncedSignal<typeof fn>(fn, { wait: 10 }))
})

it('exposes replacement values in the attached debouncer state', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal('initial', { wait: 100 }, (state) => state.lastArgs),
  )
  TestBed.tick()
  value.set('pending')
  expect(value.debouncer.state()).toEqual(['pending'])
  expect(value()).toBe('initial')
  value.debouncer.flush()
  expect(value()).toBe('pending')
})

it('reads the initial accessor once without resetting pending local writes', () => {
  vi.useFakeTimers()
  const initial = signal('a')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(initial, { wait: 100 }),
  )
  expect(value()).toBe('a')
  TestBed.tick()
  value.set('local')
  initial.set('b')
  TestBed.tick()
  expect(value()).toBe('a')
  vi.advanceTimersByTime(100)
  expect(value()).toBe('local')
})

it('implements the writable signal contract with a live readonly view', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(0, { wait: 0 }),
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
  value.debouncer.flush()
  expect(readonlyValue()).toBe(1)
})

it('names the signal helper when called outside an injection context', () => {
  expect(() => injectDebouncedSignal(0, { wait: 0 })).toThrowError(
    /injectDebouncedSignal.*injection context/,
  )
})
