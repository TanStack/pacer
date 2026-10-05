import { Debouncer } from '@tanstack/pacer/debouncer'
import { createComponent, createRoot, createSignal } from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PacerProvider } from '../src/provider/PacerProvider'
import { createAsyncThrottler } from '../src/async-throttler/createAsyncThrottler'
import { createAsyncRateLimiter } from '../src/async-rate-limiter/createAsyncRateLimiter'
import { createAsyncQueuer } from '../src/async-queuer/createAsyncQueuer'
import { createAsyncDebouncer } from '../src/async-debouncer/createAsyncDebouncer'
import { createAsyncBatcher } from '../src/async-batcher/createAsyncBatcher'
import { createThrottler } from '../src/throttler/createThrottler'
import { createQueuer } from '../src/queuer/createQueuer'
import { createDebouncer } from '../src/debouncer/createDebouncer'
import { createBatcher } from '../src/batcher/createBatcher'
import { createRateLimiter } from '../src/rate-limiter/createRateLimiter'

it('updates accessor options while retaining the limiter and store', () => {
  let dispose = () => {}
  let setLimit = (_value: number) => {}
  let limiter!: ReturnType<typeof createRateLimiter>
  createRoot((cleanup) => {
    dispose = cleanup
    const [limit, updateLimit] = createSignal(1)
    setLimit = updateLimit
    limiter = createRateLimiter(
      () => {},
      () => ({ limit: limit(), window: 1000 }),
    )
  })
  const store = limiter.store
  expect(limiter.maybeExecute()).toBe(true)
  expect(limiter.maybeExecute()).toBe(false)
  setLimit(2)
  expect(limiter.store).toBe(store)
  expect(limiter.options.limit).toBe(2)
  expect(limiter.maybeExecute()).toBe(true)
  dispose()
})

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

type SharedOptions = {
  wait: number
  limit: number
  window: number
  maxSize: number
  onUnmount: () => void
}

type OptionsInput = SharedOptions | (() => SharedOptions)

const cases = [
  {
    name: 'Batcher',
    create: (options: OptionsInput) =>
      createBatcher((_value: Array<string>) => {}, options),
  },
  {
    name: 'Debouncer',
    create: (options: OptionsInput) =>
      createDebouncer((_value: string) => {}, options),
  },
  {
    name: 'Queuer',
    create: (options: OptionsInput) =>
      createQueuer((_value: string) => {}, options),
  },
  {
    name: 'RateLimiter',
    create: (options: OptionsInput) =>
      createRateLimiter((_value: string) => {}, options),
  },
  {
    name: 'Throttler',
    create: (options: OptionsInput) =>
      createThrottler((_value: string) => {}, options),
  },
  {
    name: 'AsyncBatcher',
    create: (options: OptionsInput) =>
      createAsyncBatcher(async (_value: Array<string>) => {}, options),
  },
  {
    name: 'AsyncDebouncer',
    create: (options: OptionsInput) =>
      createAsyncDebouncer(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncQueuer',
    create: (options: OptionsInput) =>
      createAsyncQueuer(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncRateLimiter',
    create: (options: OptionsInput) =>
      createAsyncRateLimiter(async (_value: string) => {}, options),
  },
  {
    name: 'AsyncThrottler',
    create: (options: OptionsInput) =>
      createAsyncThrottler(async (_value: string) => {}, options),
  },
]

for (const entry of cases) {
  it.each(['factory', 'getters'] as const)(
    `${entry.name} updates %s options and uses the latest cleanup callback`,
    (form) => {
      const first = vi.fn(),
        latest = vi.fn()
      let dispose = () => {},
        update = (_value: number) => {}
      let utility!: ReturnType<typeof entry.create>
      createRoot((cleanup) => {
        dispose = cleanup
        const [value, setValue] = createSignal(1)
        update = setValue
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
        utility = entry.create(
          form === 'factory' ? () => ({ ...options }) : options,
        )
      })
      const store = utility.store
      const initial = utility
      expect(utility.options).toMatchObject({ wait: 1, limit: 1, maxSize: 1 })
      update(2)
      expect(utility).toBe(initial)
      expect(utility.store).toBe(store)
      expect(utility.options).toMatchObject({ wait: 2, limit: 2, maxSize: 2 })
      expect(first).not.toHaveBeenCalled()
      dispose()
      expect(first).not.toHaveBeenCalled()
      expect(latest).toHaveBeenCalledExactlyOnceWith(utility)
      expect(latest.mock.calls[0]![0].state()).toEqual({})
    },
  )
}

it('keeps object options snapshots and cancels pending work on disposal', () => {
  const callback = vi.fn(),
    options = { wait: 100 }
  let dispose = () => {}
  createRoot((cleanup) => {
    dispose = cleanup
    const utility = createDebouncer(callback, options)
    expect(Object.getPrototypeOf(utility)).toBe(Object.prototype)
    expect(utility).not.toBeInstanceOf(Debouncer)
    options.wait = 10
    expect(utility.options.wait).toBe(100)
    utility.maybeExecute()
  })
  dispose()
  vi.advanceTimersByTime(100)
  expect(callback).not.toHaveBeenCalled()
})

it.each(['factory', 'getters'] as const)(
  'does not discard pending work when %s options change',
  (form) => {
    const callback = vi.fn()
    let dispose = () => {},
      update = (_value: number) => {}
    let utility!: ReturnType<typeof createDebouncer<typeof callback>>
    createRoot((cleanup) => {
      dispose = cleanup
      const [wait, setWait] = createSignal(100)
      update = setWait
      const options = {
        get wait() {
          return wait()
        },
      }
      utility = createDebouncer(
        callback,
        form === 'factory' ? () => ({ ...options }) : options,
      )
    })
    utility.maybeExecute('value')
    expect(Object.getPrototypeOf(utility)).toBe(Object.prototype)
    expect(utility).not.toBeInstanceOf(Debouncer)
    vi.advanceTimersByTime(50)
    update(200)
    vi.advanceTimersByTime(50)
    expect(callback).toHaveBeenCalledExactlyOnceWith('value')
    dispose()
  },
)

it.each(['factory', 'getters'] as const)(
  'uses default cleanup when %s options explicitly clear onUnmount',
  (form) => {
    const callback = vi.fn(),
      onUnmount = vi.fn()
    let dispose = () => {},
      removeCallback = () => {}
    createRoot((cleanup) => {
      dispose = cleanup
      const [custom, setCustom] = createSignal(true)
      removeCallback = () => setCustom(false)
      const options = {
        wait: 100,
        get onUnmount() {
          return custom() ? onUnmount : undefined
        },
      }
      const utility = createDebouncer(
        callback,
        form === 'factory' ? () => ({ ...options }) : options,
      )
      utility.maybeExecute()
    })
    removeCallback()
    dispose()
    vi.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
    expect(onUnmount).not.toHaveBeenCalled()
  },
)

it('merges provider defaults on each factory update', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let utility!: ReturnType<typeof createDebouncer>
  createRoot((cleanup) => {
    dispose = cleanup
    const [wait, setWait] = createSignal(100)
    update = setWait
    createComponent(PacerProvider, {
      defaultOptions: { debouncer: { leading: true, trailing: false } },
      get children() {
        utility = createDebouncer(
          () => {},
          () => ({
            wait: wait(),
            ...(wait() === 100 ? { leading: false } : {}),
          }),
        )
        return null
      },
    })
  })
  expect(utility.options).toMatchObject({
    wait: 100,
    leading: false,
    trailing: false,
  })
  update(200)
  expect(utility.options).toMatchObject({
    wait: 200,
    leading: true,
    trailing: false,
  })
  dispose()
})
