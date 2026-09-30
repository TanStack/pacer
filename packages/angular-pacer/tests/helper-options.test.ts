import '@angular/compiler'
import { Component, Input, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { injectDebouncedValue } from '../src/debouncer/injectDebouncedValue'
import { injectRateLimitedValue } from '../src/rate-limiter/injectRateLimitedValue'
import { injectThrottledValue } from '../src/throttler/injectThrottledValue'
import { injectQueuedValue } from '../src/queuer/injectQueuedValue'
import { injectQueuedSignal } from '../src/queuer/injectQueuedSignal'
import { injectAsyncQueuedSignal } from '../src/async-queuer/injectAsyncQueuedSignal'
import { injectDebouncedCallback } from '../src/debouncer/injectDebouncedCallback'

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
)
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  TestBed.resetTestingModule()
  vi.useRealTimers()
})

it('accepts factory options in each value helper with an explicit initial value', () => {
  const wait = signal(100),
    source = signal('source')
  const helpers = TestBed.runInInjectionContext(() => [
    injectDebouncedValue(source, 'initial', () => ({ wait: wait() }), undefined)
      .debouncer,
    injectThrottledValue(source, 'initial', () => ({ wait: wait() }), undefined)
      .throttler,
    injectRateLimitedValue(
      source,
      'initial',
      () => ({ limit: 1, window: wait() }),
      undefined,
    ).rateLimiter,
    injectQueuedValue(
      source,
      'initial',
      () => ({ wait: wait(), started: false }),
      undefined,
    ).queuer,
  ])
  TestBed.tick()
  for (const helper of helpers)
    expect(helper.options).toMatchObject(
      'window' in helper.options ? { window: 100 } : { wait: 100 },
    )
  wait.set(200)
  TestBed.tick()
  for (const helper of helpers)
    expect(helper.options).toMatchObject(
      'window' in helper.options ? { window: 200 } : { wait: 200 },
    )
})

it('keeps factory options and selector arguments distinct', () => {
  const source = signal('value')
  const helper = TestBed.runInInjectionContext(() =>
    injectDebouncedValue(
      source,
      () => ({ wait: 100 }),
      (state) => ({ pending: state.isPending }),
    ),
  )
  TestBed.tick()
  expect(helper.debouncer.options.wait).toBe(100)
  expect(helper.debouncer.state().pending).toBe(true)
  vi.advanceTimersByTime(100)
  expect(helper()).toBe('value')
})

it('defers callback and queue-signal helpers until required inputs are bound', () => {
  const callback = vi.fn()
  class Helpers {
    wait = input.required<number>()
    debounced = injectDebouncedCallback(callback, () => ({ wait: this.wait() }))
    queued = injectQueuedSignal(callback, () => ({
      wait: this.wait(),
      started: false,
    }))
    asyncQueued = injectAsyncQueuedSignal(
      (value: string) => Promise.resolve(callback(value)),
      () => ({ wait: this.wait(), started: false }),
    )
  }
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    Helpers.prototype,
    'wait',
  )
  Component({ standalone: true, template: '' })(Helpers)
  const fixture = TestBed.createComponent(Helpers)
  fixture.componentRef.setInput('wait', 100)
  fixture.detectChanges()
  fixture.componentInstance.debounced('debounced')
  fixture.componentInstance.queued.addItem('queued')
  fixture.componentInstance.asyncQueued.addItem('asyncQueued')
  expect(fixture.componentInstance.queued.queuer.options.wait).toBe(100)
  expect(fixture.componentInstance.asyncQueued.queuer.options.wait).toBe(100)
  vi.advanceTimersByTime(100)
  expect(callback).toHaveBeenCalledExactlyOnceWith('debounced')
})
