import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectRateLimitedSignal } from '../../src/rate-limiter/injectRateLimitedSignal'

it('returns an Angular signal with a callable rateLimiter attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal(0, { limit: 1, window: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expect(value()).toBe(0)
  expect(value).toHaveProperty('rateLimiter')
  const callback = vi.fn()
  value.rateLimiter.maybeExecute(callback)
  expect(callback).toHaveBeenCalledOnce()
})

it('accepts set calls up to the limit, rejects excess calls, and accepts again after the window', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal('initial', { limit: 2, window: 100 }),
  )
  TestBed.tick()
  value.set('first')
  expect(value()).toBe('first')
  value.set('second')
  expect(value()).toBe('second')
  value.set('rejected')
  expect(value()).toBe('second')
  vi.advanceTimersByTime(99)
  value.set('still rejected')
  expect(value()).toBe('second')
  vi.advanceTimersByTime(2)
  expect(value()).toBe('second')
  value.set('next window')
  expect(value()).toBe('next window')
})

it('shares the limit between set and update and runs accepted updaters with the current value', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal(0, { limit: 2, window: 100 }),
  )
  const update = vi.fn((previous: number) => previous + 5)
  const rejected = vi.fn((previous: number) => previous * 2)
  TestBed.tick()
  value.set(10)
  value.update(update)
  expect(update).toHaveBeenCalledExactlyOnceWith(10)
  expect(value()).toBe(15)
  value.update(rejected)
  expect(rejected).not.toHaveBeenCalled()
  expect(value()).toBe(15)
  vi.advanceTimersByTime(101)
  value.update(update)
  expect(update).toHaveBeenLastCalledWith(15)
  expect(value()).toBe(20)
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal('initial', { limit: 5, window: 1000 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.rateLimiter.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  const before = value.rateLimiter.state().count
  value.set('updated')
  expect(value()).toBe('updated')
  expect(value.rateLimiter.state().count).toBe(before + 1)
})
