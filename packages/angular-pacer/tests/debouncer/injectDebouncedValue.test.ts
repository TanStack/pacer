import { ApplicationRef, isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectDebouncedValue } from '../../src/debouncer/injectDebouncedValue'

it('returns an Angular signal with the debouncer as an attribute', () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(source, { wait: 100 }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<string>()
  expect(value()).toBe('initial')
  expect(value).toHaveProperty('debouncer')
  TestBed.tick()
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('initial')
  value.debouncer.flush()
  expect(value()).toBe('updated')
})

it('debounces source changes until the delay after the latest value', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(source, { wait: 100 }),
  )
  TestBed.tick()
  expect(value()).toBe('initial')

  source.set('first')
  TestBed.tick()
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(60)
  expect(value()).toBe('initial')

  source.set('latest')
  TestBed.tick()
  vi.advanceTimersByTime(40)
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(59)
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(1)
  expect(value()).toBe('latest')
})

it('passes selected state through to the attached utility', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(source, { wait: 100 }, (state) => ({
      count: state.executionCount,
    })),
  )
  expectTypeOf(value.debouncer.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  TestBed.tick()
  value.debouncer.flush()
  const before = value.debouncer.state().count
  source.set('updated')
  TestBed.tick()
  value.debouncer.flush()
  expect(value()).toBe('updated')
  expect(value.debouncer.state().count).toBe(before + 1)
})

it('does not hold stability for an unchanged initial value', async () => {
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(
      () => ({ message: source() }),
      { wait: 1000 },
      (state) => state.isPending,
    ),
  )
  TestBed.tick()
  expect(value()).toEqual({ message: 'initial' })
  expect(value.debouncer.state()).toBe(false)
  await TestBed.inject(ApplicationRef).whenStable()
})

it('paces a source change observed before the first effect', () => {
  vi.useFakeTimers()
  const source = signal('initial')
  const value = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(source, { wait: 100 }),
  )
  expect(value()).toBe('initial')
  source.set('updated')
  TestBed.tick()
  expect(value()).toBe('initial')
  vi.advanceTimersByTime(100)
  expect(value()).toBe('updated')
})
