import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectDebouncedSignal } from '../../src/debouncer/injectDebouncedSignal'

it('returns an Angular signal with the debouncer as an attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedSignal(0, { wait: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expect(value()).toBe(0)
  expect(value).toHaveProperty('debouncer')
  TestBed.tick()
  const callback = vi.fn()
  value.debouncer.maybeExecute(callback)
  expect(callback).not.toHaveBeenCalled()
  value.debouncer.flush()
  expect(callback).toHaveBeenCalledOnce()
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

  // @ts-expect-error Function values must be wrapped to distinguish them from accessors.
  void (() => injectDebouncedSignal<typeof fn>(fn, { wait: 10 }))
})
