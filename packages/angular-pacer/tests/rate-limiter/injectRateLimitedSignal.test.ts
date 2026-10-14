import { isSignal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectRateLimitedSignal } from '../../src/rate-limiter/injectRateLimitedSignal'
import type { Signal, WritableSignal } from '@angular/core'

it('returns an Angular signal with a callable rateLimiter attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal(0, { limit: 1, window: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<number>()
  expect(value()).toBe(0)
  expect(value).toHaveProperty('rateLimiter')
  value.rateLimiter.maybeExecute(1)
  expect(value()).toBe(1)
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

it('implements the writable signal contract with a live readonly view', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal(0, { limit: 2, window: 100 }),
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
  expect(readonlyValue()).toBe(1)
})

it('preserves function values through set and requires raw writes to return them', () => {
  const fn = () => 1
  const replacement = vi.fn(() => 2)
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedSignal<typeof fn>(() => fn, { limit: 5, window: 100 }),
  )
  TestBed.tick()
  value.set(replacement)
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()
  value.update(() => fn)
  expect(value()).toBe(fn)

  // @ts-expect-error Raw utility functions must return a value of the signal's type.
  void (() => value.rateLimiter.maybeExecute(() => 2))
  value.rateLimiter.maybeExecute(() => replacement)
  expect(value()).toBe(replacement)
  expect(replacement).not.toHaveBeenCalled()
})
