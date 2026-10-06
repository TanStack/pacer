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
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectDebouncedSignal } from '../src/debouncer/injectDebouncedSignal'
import { injectThrottledSignal } from '../src/throttler/injectThrottledSignal'
import { injectRateLimitedSignal } from '../src/rate-limiter/injectRateLimitedSignal'

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
)
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  TestBed.resetTestingModule()
  vi.useRealTimers()
})

it.each(['factory', 'getters'] as const)(
  'accepts %s options in each value helper',
  (mode) => {
    const wait = signal(100),
      source = signal('source')
    const options = {
      get wait() {
        return wait()
      },
      limit: 1,
      get window() {
        return wait()
      },
      started: false,
    }
    const helpers = TestBed.runInInjectionContext(() =>
      mode === 'factory'
        ? [
            injectDebouncedValue(source, () => options).debouncer,
            injectThrottledValue(source, () => options).throttler,
            injectRateLimitedValue(source, () => options).rateLimiter,
            injectQueuedValue(source, () => options).queuer,
          ]
        : [
            injectDebouncedValue(source, options).debouncer,
            injectThrottledValue(source, options).throttler,
            injectRateLimitedValue(source, options).rateLimiter,
            injectQueuedValue(source, options).queuer,
          ],
    )
    TestBed.tick()
    for (const helper of helpers)
      expect(helper.options()).toMatchObject(
        'window' in helper.options() ? { window: 100 } : { wait: 100 },
      )
    wait.set(200)
    TestBed.tick()
    for (const helper of helpers)
      expect(helper.options()).toMatchObject(
        'window' in helper.options() ? { window: 200 } : { wait: 200 },
      )
  },
)

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
  expect(helper.debouncer.options().wait).toBe(100)
  expect(helper.debouncer.state().pending).toBe(true)
  vi.advanceTimersByTime(100)
  expect(helper()).toBe('value')
})

it.each(['factory', 'getters'] as const)(
  'defers %s in callback and queue-signal helpers until required inputs are bound',
  (mode) => {
    const callback = vi.fn()
    const createOptions = (readWait: () => number) => {
      const options = {
        get wait() {
          return readWait()
        },
        started: false,
      }
      return mode === 'factory' ? () => options : options
    }
    class Helpers {
      wait = input.required<number>()
      options = createOptions(this.wait)
      debounced = injectDebouncer(callback, this.options)
      queued = injectQueuedSignal(callback, this.options)
      asyncQueued = injectAsyncQueuedSignal(
        (value: string) => Promise.resolve(callback(value)),
        this.options,
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
    fixture.componentInstance.debounced.maybeExecute('debounced')
    fixture.componentInstance.queued.addItem('queued')
    fixture.componentInstance.asyncQueued.addItem('asyncQueued')
    expect(fixture.componentInstance.queued.queuer.options().wait).toBe(100)
    expect(fixture.componentInstance.asyncQueued.queuer.options().wait).toBe(
      100,
    )
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledExactlyOnceWith('debounced')
  },
)

it('updates getter options in each managed signal helper', () => {
  const wait = signal(100)
  const options = {
    get wait() {
      return wait()
    },
    get window() {
      return wait()
    },
    limit: 1,
  }
  const helpers = TestBed.runInInjectionContext(() => [
    injectDebouncedSignal('initial', options).debouncer,
    injectThrottledSignal('initial', options).throttler,
    injectRateLimitedSignal('initial', options).rateLimiter,
  ])
  TestBed.tick()
  wait.set(200)
  TestBed.tick()
  for (const helper of helpers) {
    expect(helper.options()).toMatchObject(
      'window' in helper.options() ? { window: 200 } : { wait: 200 },
    )
  }
})
