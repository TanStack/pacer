import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectThrottledSignal } from '../../src/throttler/injectThrottledSignal'

it('returns an Angular signal with a callable throttler attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledSignal(0, { wait: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expect(value()).toBe(0)
  expect(value).toHaveProperty('throttler')
  const callback = vi.fn()
  value.throttler.maybeExecute(callback)
  expect(callback).toHaveBeenCalledOnce()
})

it('applies leading set immediately and the latest trailing set at the original deadline', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledSignal('initial', { wait: 100 }),
  )
  TestBed.tick()
  value.set('leading')
  expect(value()).toBe('leading')
  vi.advanceTimersByTime(20)
  value.set('first trailing')
  vi.advanceTimersByTime(40)
  value.set('latest trailing')
  expect(value()).toBe('leading')
  vi.advanceTimersByTime(39)
  expect(value()).toBe('leading')
  vi.advanceTimersByTime(1)
  expect(value()).toBe('latest trailing')
})

it('supports leading set and trailing update with only the latest updater applied', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledSignal(0, { wait: 100 }),
  )
  const first = vi.fn((previous: number) => previous + 1)
  const latest = vi.fn((previous: number) => previous + 5)
  TestBed.tick()
  value.set(10)
  value.update(first)
  vi.advanceTimersByTime(60)
  value.update(latest)
  vi.advanceTimersByTime(39)
  expect(value()).toBe(10)
  expect(first).not.toHaveBeenCalled()
  expect(latest).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(value()).toBe(15)
  expect(first).not.toHaveBeenCalled()
  expect(latest).toHaveBeenCalledExactlyOnceWith(10)
  vi.advanceTimersByTime(100)
  value.set(2)
  expect(value()).toBe(2)
})

it('defers the first write when leading is disabled', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledSignal(0, { wait: 100, leading: false }),
  )
  TestBed.tick()
  value.set(10)
  vi.advanceTimersByTime(99)
  expect(value()).toBe(0)
  vi.advanceTimersByTime(1)
  expect(value()).toBe(10)
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledSignal('initial', { wait: 100 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.throttler.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  value.throttler.flush()
  const before = value.throttler.state().count
  value.set('updated')
  value.throttler.flush()
  expect(value()).toBe('updated')
  expect(value.throttler.state().count).toBe(before + 1)
})
