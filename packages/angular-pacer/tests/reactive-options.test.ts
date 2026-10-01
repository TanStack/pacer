import '@angular/compiler'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { Component, Input, effect, input, signal } from '@angular/core'
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

type TestOptions = {
  wait: number
  limit: number
  window: number
  maxSize: number
  onUnmount?: () => void
}

type OptionsFactory = TestOptions | (() => TestOptions)

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

for (const entry of cases) {
  it(`${entry.name} tracks getter options without replacing its store`, () => {
    const first = vi.fn(),
      latest = vi.fn(),
      value = signal(1)
    const options = {
      get wait() {
        return value()
      },
      get limit() {
        return value()
      },
      window: 1000,
      get maxSize() {
        return value()
      },
      get onUnmount() {
        return value() === 1 ? first : latest
      },
    }
    const utility = TestBed.runInInjectionContext(() => entry.create(options))
    TestBed.tick()
    const store = utility.store
    expect(utility.options).toMatchObject({ wait: 1, limit: 1, maxSize: 1 })
    value.set(2)
    TestBed.tick()
    expect(utility.store).toBe(store)
    expect(utility.options).toMatchObject({ wait: 2, limit: 2, maxSize: 2 })
    expect(first).not.toHaveBeenCalled()
    expect(latest).not.toHaveBeenCalled()
    TestBed.resetTestingModule()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledExactlyOnceWith(utility)
  })
}

for (const source of ['fields', 'utility'] as const) {
  it(`tracks provider defaults ${source} getters with plain options`, () => {
    const leading = signal(true)
    const read = vi.fn(() => leading())
    const defaults =
      source === 'fields'
        ? {
            debouncer: {
              get leading() {
                return read()
              },
              trailing: false,
            },
          }
        : {
            get debouncer() {
              return { leading: read(), trailing: false }
            },
          }
    TestBed.configureTestingModule({
      providers: [providePacerOptions(defaults)],
    })
    const callback = vi.fn()
    const utility = TestBed.runInInjectionContext(() =>
      injectDebouncer(callback, { wait: 100 }),
    )
    expect(read).not.toHaveBeenCalled()
    TestBed.tick()
    expect(utility.options.leading).toBe(true)
    utility.maybeExecute()
    expect(callback).toHaveBeenCalledOnce()
    leading.set(false)
    TestBed.tick()
    expect(utility.options.leading).toBe(false)
  })
}

it('defers getter reads until required inputs are bound and recovers after an early read', () => {
  class RequiredOptions {
    limit = input.required<number>()
    limiter: ReturnType<typeof injectRateLimiter>
    constructor() {
      const limit = this.limit
      this.limiter = injectRateLimiter(() => {}, {
        get limit() {
          return limit()
        },
        window: 1000,
      })
    }
  }
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

for (const entry of cases) {
  it(`${entry.name} passes its public instance to a manually updated cleanup`, () => {
    const cleanup = vi.fn()
    const utility = TestBed.runInInjectionContext(() =>
      entry.create(() => ({
        wait: 100,
        limit: 1,
        window: 1000,
        maxSize: 10,
      })),
    )
    TestBed.tick()
    utility.setOptions({ onUnmount: cleanup })
    TestBed.resetTestingModule()
    expect(cleanup).toHaveBeenCalledOnce()
    expect(cleanup.mock.calls[0]?.[0]).toBe(utility)
  })
}

it('retains omitted options, applies provider fallbacks, and clears explicit undefined', () => {
  const cleanup = vi.fn(),
    execute = vi.fn(),
    phase = signal(0)
  TestBed.configureTestingModule({
    providers: [providePacerOptions({ debouncer: { leading: false } })],
  })
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(
      () => {},
      () => ({
        wait: 100,
        ...(phase() === 0
          ? { leading: true, onExecute: execute, onUnmount: cleanup }
          : {}),
        ...(phase() === 2
          ? { onExecute: undefined, onUnmount: undefined }
          : {}),
      }),
    ),
  )
  TestBed.tick()
  expect(utility.options.leading).toBe(true)
  phase.set(1)
  TestBed.tick()
  expect(utility.options.leading).toBe(false)
  expect(utility.options.onExecute).toBe(execute)
  expect(utility.options.onUnmount).toBe(cleanup)
  phase.set(2)
  TestBed.tick()
  expect(utility.options.onExecute).toBeUndefined()
  expect(utility.options.onUnmount).toBeUndefined()
  TestBed.resetTestingModule()
  expect(cleanup).not.toHaveBeenCalled()
})

it('does not evaluate getters when destroyed before initialization', () => {
  const read = vi.fn(() => 100)
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(() => {}, {
      get wait() {
        return read()
      },
    }),
  )
  expect(read).not.toHaveBeenCalled()
  TestBed.resetTestingModule()
  expect(read).not.toHaveBeenCalled()
  expect(() => utility.options).toThrow(
    'after its injection context is destroyed',
  )
  expect(read).not.toHaveBeenCalled()
})

for (const source of ['fields', 'utility'] as const) {
  it(`defers provider ${source} getters until required inputs are bound`, () => {
    let required!: () => boolean
    const defaults =
      source === 'fields'
        ? {
            debouncer: {
              get leading() {
                return required()
              },
            },
          }
        : {
            get debouncer() {
              return { leading: required() }
            },
          }
    TestBed.configureTestingModule({
      providers: [providePacerOptions(defaults)],
    })
    class RequiredDefaults {
      leading = input.required<boolean>()
      utility: ReturnType<typeof injectDebouncer>
      constructor() {
        required = this.leading
        this.utility = injectDebouncer(() => {}, { wait: 100 })
      }
    }
    Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
      RequiredDefaults.prototype,
      'leading',
    )
    Component({ standalone: true, template: '' })(RequiredDefaults)
    const fixture = TestBed.createComponent(RequiredDefaults)
    fixture.componentRef.setInput('leading', true)
    fixture.detectChanges()
    expect(fixture.componentInstance.utility.options.leading).toBe(true)
    fixture.componentRef.setInput('leading', false)
    fixture.detectChanges()
    expect(fixture.componentInstance.utility.options.leading).toBe(false)
  })
}

it('tracks option reads without subscribing to function-valued core reads', () => {
  const wait = signal(100),
    incidental = signal(true)
  const enabled = vi.fn(() => incidental()),
    onExecute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(() => {}, {
      get wait() {
        return wait()
      },
      enabled,
      onExecute,
    }),
  )
  TestBed.tick()
  expect(utility.options.enabled).toBe(enabled)
  expect(utility.options.onExecute).toBe(onExecute)
  expect(onExecute).not.toHaveBeenCalled()
  const calls = enabled.mock.calls.length
  incidental.set(false)
  TestBed.tick()
  expect(enabled).toHaveBeenCalledTimes(calls)
  wait.set(200)
  TestBed.tick()
  expect(enabled.mock.calls.length).toBeGreaterThan(calls)
  expect(utility.options.wait).toBe(200)
})

it('constructs data-only options eagerly and outside the caller tracking context', () => {
  const incidental = signal(true),
    calls = vi.fn()
  let utility!: ReturnType<typeof injectDebouncer>
  TestBed.runInInjectionContext(() =>
    effect(() => {
      calls()
      utility = TestBed.runInInjectionContext(() =>
        injectDebouncer(() => {}, {
          wait: 100,
          enabled: () => incidental(),
        }),
      )
      expect(utility.options.wait).toBe(100)
    }),
  )
  TestBed.tick()
  incidental.set(false)
  TestBed.tick()
  expect(calls).toHaveBeenCalledOnce()
})

it('cancels pending work when an enabled getter becomes false after the effect runs', () => {
  const enabled = signal(true),
    callback = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(callback, {
      wait: 100,
      get enabled() {
        return enabled()
      },
    }),
  )
  TestBed.tick()
  utility.maybeExecute()
  enabled.set(false)
  expect(utility.store.state.isPending).toBe(true)
  TestBed.tick()
  expect(utility.store.state.isPending).toBe(false)
  vi.advanceTimersByTime(100)
  expect(callback).not.toHaveBeenCalled()
})

it('consumes queue initialization options once when getters update', () => {
  const version = signal(1),
    callback = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectQueuer(callback, {
      get started() {
        return version() > 1
      },
      get initialItems() {
        return [`item-${version()}`]
      },
      get initialState() {
        return { executionCount: version() }
      },
      get wait() {
        return version() * 100
      },
    }),
  )
  TestBed.tick()
  const store = utility.store
  expect(utility.peekAllItems()).toEqual(['item-1'])
  version.set(2)
  TestBed.tick()
  expect(utility.store).toBe(store)
  expect(utility.peekAllItems()).toEqual(['item-1'])
  expect(utility.store.state).toMatchObject({
    isRunning: false,
    executionCount: 1,
  })
  expect(callback).not.toHaveBeenCalled()
})

it('types manual option updates with the selected adapter state', () => {
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(
      () => {},
      {
        get wait() {
          return 100
        },
      },
      (state) => ({ pending: state.isPending }),
    ),
  )
  const cleanup = vi.fn((received: typeof utility) => {
    expect(received).toBe(utility)
    expect(received.state().pending).toBe(false)
  })
  utility.setOptions({ onUnmount: cleanup })
  expect(utility.options.onUnmount).toBe(cleanup)
  TestBed.resetTestingModule()
  expect(cleanup).toHaveBeenCalledOnce()
})

it.each([false, true])(
  'uses provider cleanup fallback unless explicitly cleared: %s',
  (clear) => {
    const providerCleanup = vi.fn(),
      localCleanup = vi.fn(),
      callback = vi.fn()
    const phase = signal<'local' | 'fallback' | 'clear'>('local')
    TestBed.configureTestingModule({
      providers: [
        providePacerOptions({ debouncer: { onUnmount: providerCleanup } }),
      ],
    })
    const utility = TestBed.runInInjectionContext(() =>
      injectDebouncer(callback, () => ({
        wait: 100,
        ...(phase() === 'local' ? { onUnmount: localCleanup } : {}),
        ...(phase() === 'clear' ? { onUnmount: undefined } : {}),
      })),
    )
    TestBed.tick()
    expect(utility.options.onUnmount).toBe(localCleanup)
    phase.set('fallback')
    TestBed.tick()
    expect(utility.options.onUnmount).toBe(providerCleanup)
    if (clear) {
      phase.set('clear')
      TestBed.tick()
      expect(utility.options.onUnmount).toBeUndefined()
      utility.maybeExecute()
    }
    TestBed.resetTestingModule()
    expect(localCleanup).not.toHaveBeenCalled()
    if (clear) {
      expect(providerCleanup).not.toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(callback).not.toHaveBeenCalled()
    } else {
      expect(providerCleanup).toHaveBeenCalledOnce()
      expect(providerCleanup.mock.calls[0]?.[0]).toBe(utility)
    }
  },
)
