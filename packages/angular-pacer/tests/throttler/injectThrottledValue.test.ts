import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectThrottledValue } from '../../src/throttler/injectThrottledValue'

it('returns an Angular signal with a callable throttler attribute', () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledValue(source, { wait: 100 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<string>()
  expect(value()).toBe('initial')
  expect(value).toHaveProperty('throttler')
  TestBed.tick()
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('updated')
  value.throttler.flush()
  expect(value()).toBe('updated')
})

it('keeps the leading edge available for the first real source change', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledValue(source, { wait: 100 }),
  )
  TestBed.tick()
  source.set('first leading')
  TestBed.tick()
  expect(value()).toBe('first leading')
  vi.advanceTimersByTime(40)
  source.set('latest trailing')
  TestBed.tick()
  expect(value()).toBe('first leading')
  vi.advanceTimersByTime(59)
  expect(value()).toBe('first leading')
  vi.advanceTimersByTime(1)
  expect(value()).toBe('latest trailing')
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectThrottledValue(source, { wait: 100 }, (state) => ({
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
