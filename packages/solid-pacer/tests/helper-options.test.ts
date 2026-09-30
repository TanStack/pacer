import { createRoot, createSignal } from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDebouncedSignal } from '../src/debouncer/createDebouncedSignal'
import { createDebouncedValue } from '../src/debouncer/createDebouncedValue'
import { createThrottledSignal } from '../src/throttler/createThrottledSignal'
import { createThrottledValue } from '../src/throttler/createThrottledValue'
import { createRateLimitedSignal } from '../src/rate-limiter/createRateLimitedSignal'
import { createRateLimitedValue } from '../src/rate-limiter/createRateLimitedValue'
import { createQueuedSignal } from '../src/queuer/createQueuedSignal'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('updates options through signal and value helpers without replacing their utilities', () => {
  let dispose = () => {}
  let update = (_value: number) => {}
  let utilities!: Array<{
    options: { wait?: unknown; window?: unknown }
    store: unknown
  }>
  createRoot((cleanup) => {
    dispose = cleanup
    const [wait, setWait] = createSignal(100)
    update = setWait
    const options = () => ({ wait: wait(), window: wait(), limit: 1 })
    utilities = [
      createDebouncedSignal('initial', options)[2],
      createDebouncedValue(() => 'initial', options)[1],
      createThrottledSignal('initial', options)[2],
      createThrottledValue(() => 'initial', options)[1],
      createRateLimitedSignal('initial', options)[2],
      createRateLimitedValue(() => 'initial', options)[1],
      createQueuedSignal((_value: string) => {}, options)[2],
    ]
  })
  const stores = utilities.map((utility) => utility.store)
  update(200)
  utilities.forEach((utility, index) => {
    expect(utility.options).toMatchObject({ wait: 200, window: 200 })
    expect(utility.store).toBe(stores[index])
  })
  dispose()
})

it('uses updated options for subsequent debounced signal writes', () => {
  let dispose = () => {}
  let updateWait = (_value: number) => {}
  let value!: () => string
  let setValue!: (value: string) => unknown
  createRoot((cleanup) => {
    dispose = cleanup
    const [wait, setWait] = createSignal(100)
    updateWait = setWait
    ;[value, setValue] = createDebouncedSignal('initial', () => ({
      wait: wait(),
    }))
  })
  setValue('first')
  vi.advanceTimersByTime(100)
  expect(value()).toBe('first')
  updateWait(200)
  setValue('second')
  vi.advanceTimersByTime(100)
  expect(value()).toBe('first')
  vi.advanceTimersByTime(100)
  expect(value()).toBe('second')
  dispose()
})
