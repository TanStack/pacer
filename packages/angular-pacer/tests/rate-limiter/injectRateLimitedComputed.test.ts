import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectRateLimitedComputed } from '../../src/rate-limiter/injectRateLimitedComputed'

it('returns an Angular signal with a callable rateLimiter attribute', () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedComputed(source, { limit: 1, window: 0 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<string>()
  expect(value()).toBe('initial')
  expect(value).toHaveProperty('rateLimiter')
  TestBed.tick()
  value.rateLimiter.reset()
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('updated')
})

it('limits source updates and discards rejected values instead of replaying them', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedComputed(source, { limit: 2, window: 100 }),
  )
  TestBed.tick()
  source.set('accepted')
  TestBed.tick()
  expect(value()).toBe('accepted')
  source.set('rejected')
  TestBed.tick()
  expect(value()).toBe('accepted')
  vi.advanceTimersByTime(99)
  expect(value()).toBe('accepted')
  vi.advanceTimersByTime(2)
  TestBed.tick()
  expect(value()).toBe('accepted')
  source.set('next window')
  TestBed.tick()
  expect(value()).toBe('next window')
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectRateLimitedComputed(source, { limit: 5, window: 1000 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.rateLimiter.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  const before = value.rateLimiter.state().count
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('updated')
  expect(value.rateLimiter.state().count).toBe(before + 1)
})
