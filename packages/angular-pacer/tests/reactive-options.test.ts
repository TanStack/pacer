import '@angular/compiler'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { Component, Input, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { providePacerOptions } from '../src/provider/pacer-provider'
import { injectAsyncThrottler } from '../src/async-throttler/injectAsyncThrottler'
import { injectAsyncRateLimiter } from '../src/async-rate-limiter/injectAsyncRateLimiter'
import { injectAsyncQueuer } from '../src/async-queuer/injectAsyncQueuer'
import { injectAsyncDebouncer } from '../src/async-debouncer/injectAsyncDebouncer'
import { injectAsyncBatcher } from '../src/async-batcher/injectAsyncBatcher'
import { injectThrottler } from '../src/throttler/injectThrottler'
import { injectQueuer } from '../src/queuer/injectQueuer'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectBatcher } from '../src/batcher/injectBatcher'
import { injectRateLimiter } from '../src/rate-limiter/injectRateLimiter'

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
)
afterEach(() => TestBed.resetTestingModule())

it('updates options without replacing the rate limiter or its store', () => {
  const limit = signal(1)
  const limiter = TestBed.runInInjectionContext(() =>
    injectRateLimiter(
      () => {},
      () => ({ limit: limit(), window: 1000 }),
    ),
  )
  TestBed.tick()
  const store = limiter.store
  expect(limiter.maybeExecute()).toBe(true)
  expect(limiter.maybeExecute()).toBe(false)
  limit.set(2)
  TestBed.tick()
  expect(limiter.store).toBe(store)
  expect(limiter.options.limit).toBe(2)
  expect(limiter.maybeExecute()).toBe(true)
})

it('reads required options inputs after Angular binds them', () => {
  class RequiredOptions {
    limit = input.required<number>()
    limiter = injectRateLimiter(
      () => {},
      () => ({ limit: this.limit(), window: 1000 }),
    )
  }
  // Supply the signal metadata normally emitted by Angular's compiler for this JIT fixture.
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    RequiredOptions.prototype,
    'limit',
  )
  Component({ standalone: true, template: '' })(RequiredOptions)
  const fixture = TestBed.createComponent(RequiredOptions)
  expect(() => fixture.componentInstance.limiter.options).toThrow(/NG0950/)
  fixture.componentRef.setInput('limit', 2)
  fixture.detectChanges()
  expect(fixture.componentInstance.limiter.options.limit).toBe(2)
  fixture.componentRef.setInput('limit', 3)
  fixture.detectChanges()
  expect(fixture.componentInstance.limiter.options.limit).toBe(3)
})

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

type OptionsFactory = () => {
  wait: number
  limit: number
  window: number
  maxSize: number
  onUnmount: () => void
}

const cases = [
  {
    name: 'Batcher',
    create: (options: OptionsFactory) =>
      injectBatcher((_value: Array<string>) => {}, options),
  },
  {
    name: 'Debouncer',
    create: (options: OptionsFactory) =>
      injectDebouncer((_value: string) => {}, options),
  },
  {
    name: 'Queuer',
    create: (options: OptionsFactory) =>
      injectQueuer((_value: string) => {}, options),
  },
  {
    name: 'RateLimiter',
    create: (options: OptionsFactory) =>
      injectRateLimiter((_value: string) => {}, options),
  },
  {
    name: 'Throttler',
    create: (options: OptionsFactory) =>
      injectThrottler((_value: string) => {}, options),
  },
  {
    name: 'AsyncBatcher',
    create: (options: OptionsFactory) =>
      injectAsyncBatcher(async (_value: Array<string>) => {}, options),
  },
  {
    name: 'AsyncDebouncer',
    create: (options: OptionsFactory) =>
      injectAsyncDebouncer(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncQueuer',
    create: (options: OptionsFactory) =>
      injectAsyncQueuer(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncRateLimiter',
    create: (options: OptionsFactory) =>
      injectAsyncRateLimiter(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncThrottler',
    create: (options: OptionsFactory) =>
      injectAsyncThrottler(async (_value: string) => {}, options),
  },
]

for (const entry of cases) {
  it(`${entry.name} updates factory options and uses the latest cleanup callback`, () => {
    const first = vi.fn(),
      latest = vi.fn(),
      value = signal(1)
    const utility = TestBed.runInInjectionContext(() =>
      entry.create(() => ({
        wait: value(),
        limit: value(),
        window: 1000,
        maxSize: value(),
        onUnmount: value() === 1 ? first : latest,
      })),
    )
    TestBed.tick()
    const initial = utility,
      store = utility.store
    expect(utility.options).toMatchObject({ wait: 1, limit: 1, maxSize: 1 })
    value.set(2)
    TestBed.tick()
    expect(utility).toBe(initial)
    expect(utility.store).toBe(store)
    expect(utility.options).toMatchObject({ wait: 2, limit: 2, maxSize: 2 })
    expect(first).not.toHaveBeenCalled()
    TestBed.resetTestingModule()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
    expect(latest).toHaveBeenCalledWith(utility)
  })
}

it('does not evaluate a factory when its component is destroyed before initialization', () => {
  const options = vi.fn(() => ({ wait: 100 }))
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(() => {}, options),
  )
  expect(Object.getPrototypeOf(utility)).toBe(Object.prototype)
  expect(utility).not.toBeInstanceOf(Debouncer)
  expect(options).not.toHaveBeenCalled()
  TestBed.resetTestingModule()
  expect(options).not.toHaveBeenCalled()
  expect(() => utility.options).toThrow(
    'after its injection context is destroyed',
  )
})

it('keeps bound methods and property writes working on the stable facade', () => {
  const callback = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectRateLimiter(callback, () => ({ limit: 1, window: 1000 })),
  )
  TestBed.tick()
  const execute = utility.maybeExecute.bind(utility)
  utility.key = 'new-key'
  utility.options = { ...utility.options, limit: 2 }
  expect(utility.key).toBe('new-key')
  expect(execute()).toBe(true)
  expect(execute()).toBe(true)
  expect(execute()).toBe(false)
  expect(Object.keys(utility)).toContain('store')
  expect('maybeExecute' in utility).toBe(true)
  expect(callback).toHaveBeenCalledTimes(2)
})

it('keeps object options eager and cancels pending work on destroy', () => {
  const callback = vi.fn()
  const options = { wait: 100 }
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(callback, options),
  )
  expect(utility.options.wait).toBe(100)
  expect(Object.getPrototypeOf(utility)).toBe(Object.prototype)
  expect(utility).not.toBeInstanceOf(Debouncer)
  utility.maybeExecute()
  TestBed.resetTestingModule()
  vi.advanceTimersByTime(100)
  expect(callback).not.toHaveBeenCalled()
})

it('uses default cleanup when an accessor removes its onUnmount callback', () => {
  const callback = vi.fn(),
    cleanup = vi.fn(),
    custom = signal(true)
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(callback, () => ({
      wait: 100,
      onUnmount: custom() ? cleanup : undefined,
    })),
  )
  TestBed.tick()
  utility.maybeExecute()
  custom.set(false)
  TestBed.tick()
  TestBed.resetTestingModule()
  vi.advanceTimersByTime(100)
  expect(cleanup).not.toHaveBeenCalled()
  expect(callback).not.toHaveBeenCalled()
})

it('preserves pending work and initial queue items across options updates', () => {
  const wait = signal(100),
    callback = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectQueuer(callback, () => ({
      wait: wait(),
      started: false,
      initialItems: ['first'],
    })),
  )
  TestBed.tick()
  expect(utility.peekAllItems()).toEqual(['first'])
  utility.addItem('second')
  wait.set(200)
  TestBed.tick()
  expect(utility.peekAllItems()).toEqual(['first', 'second'])
  utility.flush()
  expect(callback.mock.calls.map(([value]) => value)).toEqual([
    'first',
    'second',
  ])
})

it('merges provider defaults on each factory update', () => {
  TestBed.configureTestingModule({
    providers: [
      providePacerOptions({ debouncer: { leading: true, trailing: false } }),
    ],
  })
  const wait = signal(100)
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(
      () => {},
      () => ({ wait: wait(), ...(wait() === 100 ? { leading: false } : {}) }),
    ),
  )
  TestBed.tick()
  expect(utility.options).toMatchObject({
    wait: 100,
    leading: false,
    trailing: false,
  })
  wait.set(200)
  TestBed.tick()
  expect(utility.options).toMatchObject({
    wait: 200,
    leading: true,
    trailing: false,
  })
})

it('applies initial state once and updates execution callbacks', () => {
  const version = signal(1)
  const first = vi.fn()
  const latest = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectRateLimiter(
      () => {},
      () => ({
        limit: 10,
        window: 1000,
        initialState: { executionCount: version() * 5 },
        onExecute: version() === 1 ? first : latest,
      }),
    ),
  )
  TestBed.tick()
  expect(utility.store.state.executionCount).toBe(5)
  utility.maybeExecute()
  expect(first).toHaveBeenCalledOnce()
  version.set(2)
  TestBed.tick()
  expect(utility.store.state.executionCount).toBe(6)
  utility.maybeExecute()
  expect(utility.store.state.executionCount).toBe(7)
  expect(first).toHaveBeenCalledOnce()
  expect(latest).toHaveBeenCalledOnce()
})
