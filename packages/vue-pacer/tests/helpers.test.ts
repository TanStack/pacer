import { useThrottledValue, useRateLimitedValue } from '../src'
import { useAsyncQueuedState } from '../src'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  useDebouncer,
  useDebouncedState,
  useDebouncedValue,
  useQueuedState,
  useQueuedValue,
} from '../src'
import { setup, source, flush } from './setup'
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
it('debounces callbacks and cancels pending work on disposal', async () => {
  const fn = vi.fn()
  const { result: callback, destroy } = setup(
    () => useDebouncer(fn, { wait: 100 }).maybeExecute,
  )
  callback('first')
  callback('last')
  await vi.advanceTimersByTimeAsync(100)
  expect(fn).toHaveBeenCalledExactlyOnceWith('last')
  callback('discard')
  destroy()
  await vi.runAllTimersAsync()
  expect(fn).toHaveBeenCalledTimes(1)
})
it('commits functional state updates when the scheduled work runs', async () => {
  const {
    result: [value, setValue, utility],
    destroy,
  } = setup(() => useDebouncedState(1, { wait: 100 }))
  setValue(10)
  setValue((previous) => previous + 2)
  expect(value.value).toBe(1)
  await vi.advanceTimersByTimeAsync(100)
  await flush()
  expect(value.value).toBe(3)
  setValue(20)
  utility.cancel()
  await vi.runAllTimersAsync()
  expect(value.value).toBe(3)
  destroy()
})
it('tracks source values without recreating the utility', async () => {
  const input = source('first')
  const {
    result: [value, utility],
    destroy,
  } = setup(() => useDebouncedValue(input.get, { wait: 100 }))
  await flush()
  input.set('second')
  await flush()
  expect(value.value).toBe('first')
  await vi.advanceTimersByTimeAsync(100)
  await flush()
  expect(value.value).toBe('second')
  expect(utility.options.wait).toBe(100)
  destroy()
  input.set('disposed')
  await flush()
  await vi.runAllTimersAsync()
  expect(value.value).toBe('second')
})
it('exposes pending items and drains the queue in order', async () => {
  const calls: Array<string> = []
  const {
    result: [items, add, queue],
    destroy,
  } = setup(() =>
    useQueuedState(
      (item: string) => {
        calls.push(item)
      },
      { started: false, wait: 10 },
    ),
  )
  add('first')
  add('second')
  await flush()
  expect(items()).toEqual(['first', 'second'])
  queue.start()
  await vi.runAllTimersAsync()
  await flush()
  expect(calls).toEqual(['first', 'second'])
  expect(items()).toEqual([])
  destroy()
})
it('preserves function-valued queue input as data', async () => {
  const first = () => 'first',
    second = () => 'second'
  const input = source(first)
  const {
    result: [value, queue],
    destroy,
  } = setup(() => useQueuedValue(input.get, { started: false }))
  await flush()
  input.set(second)
  await flush()
  queue.start()
  await vi.runAllTimersAsync()
  await flush()
  expect(value.value).toBe(second)
  destroy()
})

it('preserves object identity inside shallow value refs', () => {
  const initial = { count: 1 }
  const {
    result: [value],
    destroy,
  } = setup(() => useDebouncedState(initial, { wait: 100 }))
  expect(value.value).toBe(initial)
  destroy()
})

it('returns the async queue as the second tuple entry', async () => {
  const calls: Array<string> = []
  const {
    result: [items, queue],
    destroy,
  } = setup(() =>
    useAsyncQueuedState(
      async (item: string) => {
        calls.push(item)
      },
      { started: false },
    ),
  )
  queue.addItem('queued')
  await flush()
  expect(items()).toEqual(['queued'])
  queue.start()
  await vi.runAllTimersAsync()
  await flush()
  expect(calls).toEqual(['queued'])
  expect(items()).toEqual([])
  destroy()
})

it.each([
  ['debounced', useDebouncedValue],
  ['throttled', useThrottledValue],
  ['rate limited', useRateLimitedValue],
] as const)(
  'preserves function-valued %s inputs as data',
  async (_name, derive) => {
    const first = () => 'first'
    const second = () => 'second'
    const input = source(first)
    const {
      result: [value],
      destroy,
    } = setup(() => derive(input.get, { wait: 100, window: 100, limit: 2 }))
    try {
      await flush()
      await vi.runAllTimersAsync()
      input.set(second)
      await flush()
      await vi.runAllTimersAsync()
      await flush()
      expect(value.value).toBe(second)
    } finally {
      destroy()
    }
  },
)
