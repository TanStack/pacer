import './helpers/angular'
import { Component, Input, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it } from 'vitest'
import { injectDebouncedValue } from '../src/debouncer/injectDebouncedValue'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import { injectRateLimitedValue } from '../src/rate-limiter/injectRateLimitedValue'

it('makes the initial source value available synchronously with honest value types', () => {
  const source = signal('hello')
  const values = TestBed.runInInjectionContext(() => [
    injectDebouncedValue(source, { wait: 100 }),
    injectThrottledValue(source, { wait: 100 }),
    injectRateLimitedValue(source, { limit: 1, window: 100 }),
  ])
  expect(values.map((value) => value())).toEqual(['hello', 'hello', 'hello'])
  for (const value of values) expect(value().toUpperCase()).toBe('HELLO')
})

it('defers required source inputs until reading the returned value', () => {
  class RequiredSource {
    source = input.required<string>()
    debounced = injectDebouncedValue(this.source, { wait: 100 })
    throttled = injectThrottledValue(this.source, { wait: 100 })
    limited = injectRateLimitedValue(this.source, { limit: 1, window: 100 })
  }
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    RequiredSource.prototype,
    'source',
  )
  Component({ standalone: true, template: '' })(RequiredSource)
  const fixture = TestBed.createComponent(RequiredSource)
  fixture.componentRef.setInput('source', 'bound')
  expect(fixture.componentInstance.debounced()).toBe('bound')
  expect(fixture.componentInstance.throttled()).toBe('bound')
  expect(fixture.componentInstance.limited()).toBe('bound')
})

it('preserves undefined and function-valued source data', () => {
  const fn = () => 'function value'
  TestBed.runInInjectionContext(() => {
    const fallback = injectDebouncedValue(
      signal<string | undefined>(undefined),
      { wait: 100 },
    )
    expect(fallback()).toBeUndefined()
    const source = signal(fn)
    const value = injectThrottledValue(source, { wait: 100 })
    expect(value()).toBe(fn)
    TestBed.tick()
    expect(value()).toBe(fn)
  })
})
