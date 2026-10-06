import './helpers/angular'
import { ApplicationRef, effect, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, expect, expectTypeOf, it, vi } from 'vitest'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectAsyncDebouncer } from '../src/async-debouncer/injectAsyncDebouncer'
import { injectDebouncedSignal } from '../src/debouncer/injectDebouncedSignal'
import { injectThrottledSignal } from '../src/throttler/injectThrottledSignal'
import { injectRateLimitedSignal } from '../src/rate-limiter/injectRateLimitedSignal'
import { injectQueuedSignal } from '../src/queuer/injectQueuedSignal'
import { injectAsyncQueuedSignal } from '../src/async-queuer/injectAsyncQueuedSignal'
import { injectBatcher } from '../src/batcher/injectBatcher'
import { injectAsyncBatcher } from '../src/async-batcher/injectAsyncBatcher'
import { injectQueuer } from '../src/queuer/injectQueuer'
import { injectAsyncQueuer } from '../src/async-queuer/injectAsyncQueuer'
import { injectThrottler } from '../src/throttler/injectThrottler'
import { injectAsyncThrottler } from '../src/async-throttler/injectAsyncThrottler'
import { injectRateLimiter } from '../src/rate-limiter/injectRateLimiter'
import { injectAsyncRateLimiter } from '../src/async-rate-limiter/injectAsyncRateLimiter'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

afterEach(() => vi.useRealTimers())

it('releases stability after a leading call suppresses trailing execution', async () => {
  vi.useFakeTimers()
  const execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(execute, { wait: 100, leading: true, trailing: true }),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  let stable = false
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  try {
    utility.maybeExecute()
    vi.advanceTimersByTime(100)
    TestBed.tick()
    expect(execute).toHaveBeenCalledTimes(1)
    expect(utility.store().state.isPending).toBe(false)
    await app.whenStable()
    expect(stable).toBe(true)
  } finally {
    utility.cancel()
    subscription.unsubscribe()
  }
})

it('keeps stability pending after reset until the retained timer executes', () => {
  vi.useFakeTimers()
  const execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(execute, { wait: 100 }),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  try {
    utility.maybeExecute()
    utility.reset()
    TestBed.tick()
    expect(utility.store().state.isPending).toBe(false)
    expect(stable).toBe(false)
    vi.advanceTimersByTime(100)
    TestBed.tick()
    expect(execute).toHaveBeenCalledTimes(1)
    expect(stable).toBe(true)
  } finally {
    utility.cancel()
    subscription.unsubscribe()
  }
})

type CleanupOptions = () => {
  wait: number
  limit: number
  window: number
  started: false
  onUnmount: () => void
}

it.each([
  {
    name: 'Debouncer',
    create: (options: CleanupOptions) => injectDebouncer(() => {}, options),
  },
  {
    name: 'AsyncDebouncer',
    create: (options: CleanupOptions) =>
      injectAsyncDebouncer(async () => {}, options),
  },
  {
    name: 'Batcher',
    create: (options: CleanupOptions) => injectBatcher(() => {}, options),
  },
  {
    name: 'AsyncBatcher',
    create: (options: CleanupOptions) =>
      injectAsyncBatcher(async () => {}, options),
  },
  {
    name: 'Queuer',
    create: (options: CleanupOptions) => injectQueuer(() => {}, options),
  },
  {
    name: 'AsyncQueuer',
    create: (options: CleanupOptions) =>
      injectAsyncQueuer(async () => {}, options),
  },
  {
    name: 'Throttler',
    create: (options: CleanupOptions) => injectThrottler(() => {}, options),
  },
  {
    name: 'AsyncThrottler',
    create: (options: CleanupOptions) =>
      injectAsyncThrottler(async () => {}, options),
  },
  {
    name: 'RateLimiter',
    create: (options: CleanupOptions) => injectRateLimiter(() => {}, options),
  },
  {
    name: 'AsyncRateLimiter',
    create: (options: CleanupOptions) =>
      injectAsyncRateLimiter(async () => {}, options),
  },
])(
  'uses the latest cleanup policy without waiting for the options effect: $name',
  ({ create }) => {
    const oldCleanup = vi.fn()
    const latestCleanup = vi.fn()
    const policy = signal(oldCleanup)
    TestBed.runInInjectionContext(() =>
      create(() => ({
        wait: 100,
        limit: 1,
        window: 100,
        started: false,
        onUnmount: policy(),
      })),
    )
    TestBed.tick()
    policy.set(latestCleanup)
    TestBed.resetTestingModule()
    expect(latestCleanup).toHaveBeenCalledTimes(1)
    expect(oldCleanup).not.toHaveBeenCalled()
  },
)

it('accepts Angular cleanup options with accurate selected state in every managed helper', () => {
  const cleaned: Array<boolean> = []
  type Setter = (value: number | ((previous: number) => number)) => void
  const selectPending = (state: DebouncerState<Setter>) => ({
    isPending: state.isPending,
  })
  const selectCount = (state: RateLimiterState) => ({
    executionCount: state.executionCount,
  })
  TestBed.runInInjectionContext(() => {
    const debounced = injectDebouncedSignal(
      0,
      {
        wait: 100,
        onUnmount: (ref) => {
          expectTypeOf(ref.state().isPending).toEqualTypeOf<boolean>()
          cleaned.push(ref.state().isPending)
        },
      },
      selectPending,
    )
    debounced.set(42)
    expectTypeOf(debounced()).toEqualTypeOf<number>()
    injectThrottledSignal(0, {
      wait: 100,
      onUnmount: (ref) => {
        expectTypeOf(ref.state()).toEqualTypeOf<Readonly<{}>>()
        cleaned.push(false)
      },
    })
    injectRateLimitedSignal(
      0,
      () => ({
        limit: 1,
        window: 100,
        onUnmount: (ref) => {
          expectTypeOf(ref.state().executionCount).toEqualTypeOf<number>()
          cleaned.push(false)
        },
      }),
      selectCount,
    )
    injectQueuedSignal((_item: string) => {}, {
      started: false,
      onUnmount: (ref) => {
        expectTypeOf(ref.state().items).toEqualTypeOf<Array<string>>()
        cleaned.push(false)
      },
    })
    injectAsyncQueuedSignal(
      async (_item: string) => {},
      () => ({
        started: false,
        onUnmount: (ref) => {
          expectTypeOf(ref.state().items).toEqualTypeOf<Array<string>>()
          cleaned.push(false)
        },
      }),
    )
  })
  TestBed.tick()
  TestBed.resetTestingModule()
  expect(cleaned).toHaveLength(5)
})

it('does not notify selected-state consumers for shallow-equal core updates', () => {
  vi.useFakeTimers()
  const observed = vi.fn()
  const utility = TestBed.runInInjectionContext(() => {
    const ref = injectDebouncer(
      () => {},
      { wait: 100 },
      (state) => ({ isPending: state.isPending }),
    )
    effect(() => observed(ref.state()))
    return ref
  })
  TestBed.tick()
  utility.maybeExecute()
  TestBed.tick()
  expect(observed).toHaveBeenCalledTimes(2)
  utility.maybeExecute()
  TestBed.tick()
  expect(observed).toHaveBeenCalledTimes(2)
})

it('updates stability when reactive trailing options change an existing timer', () => {
  vi.useFakeTimers()
  const trailing = signal(false)
  const execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(execute, () => ({ wait: 100, trailing: trailing() })),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  try {
    utility.maybeExecute()
    TestBed.tick()
    expect(stable).toBe(true)
    trailing.set(true)
    TestBed.tick()
    expect(stable).toBe(false)
    trailing.set(false)
    TestBed.tick()
    expect(stable).toBe(true)
    trailing.set(true)
    TestBed.tick()
    vi.advanceTimersByTime(100)
    TestBed.tick()
    expect(execute).toHaveBeenCalledTimes(1)
    expect(stable).toBe(true)
  } finally {
    utility.cancel()
    subscription.unsubscribe()
  }
})

it.each([false, true])(
  'explicitly clears cleanup policy before disposal (effect connected: %s)',
  (connected) => {
    vi.useFakeTimers()
    const cleanup = vi.fn()
    const execute = vi.fn()
    const policy = signal<(() => void) | undefined>(cleanup)
    const utility = TestBed.runInInjectionContext(() =>
      injectDebouncer(execute, () => ({ wait: 100, onUnmount: policy() })),
    )
    utility.maybeExecute()
    if (connected) TestBed.tick()
    policy.set(undefined)
    TestBed.resetTestingModule()
    vi.advanceTimersByTime(100)
    expect(cleanup).not.toHaveBeenCalled()
    expect(execute).not.toHaveBeenCalled()
  },
)

it('preserves a cleanup policy omitted from the latest options factory', () => {
  const cleanup = vi.fn()
  const includePolicy = signal(true)
  TestBed.runInInjectionContext(() =>
    injectDebouncer(
      () => {},
      () =>
        includePolicy() ? { wait: 100, onUnmount: cleanup } : { wait: 100 },
    ),
  )
  TestBed.tick()
  includePolicy.set(false)
  TestBed.resetTestingModule()
  expect(cleanup).toHaveBeenCalledTimes(1)
})
