import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectThrottledComputed } from '../../src/throttler/injectThrottledComputed'

it('returns an Angular signal with a callable throttler attribute', () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledComputed(source, { wait: 100 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<string>()
  expect(value()).toBe('initial')
  expect(value).toHaveProperty('throttler')
  TestBed.tick()
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('initial')
  value.throttler.flush()
  expect(value()).toBe('updated')
})

it('applies the latest source change at the original throttle deadline', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledComputed(source, { wait: 100 }),
  )
  TestBed.tick()
  vi.advanceTimersByTime(20)
  source.set('first trailing')
  TestBed.tick()
  vi.advanceTimersByTime(40)
  source.set('latest trailing')
  TestBed.tick()
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(39)
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(1)
  expect(value()).toBe('latest trailing')
  vi.advanceTimersByTime(100)
  source.set('next leading')
  TestBed.tick()
  expect(value()).toBe('next leading')
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledComputed(source, { wait: 100 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.throttler.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  value.throttler.flush()
  const before = value.throttler.state().count
  source.set('updated')
  TestBed.tick()
  value.throttler.flush()
  expect(value()).toBe('updated')
  expect(value.throttler.state().count).toBe(before + 1)
})
