import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  createDebouncedCallback,
  createDebouncedSignal,
  createDebouncedValue,
  createQueuedSignal,
  createQueuedValue,
} from '../src'
import { setup, source, flush } from './setup'
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
it('debounces callbacks and cancels pending work on disposal', async () => {
  const fn = vi.fn()
  const { result: callback, destroy } = setup(() =>
    createDebouncedCallback(fn, { wait: 100 }),
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
  } = setup(() => createDebouncedSignal(1, { wait: 100 }))
  setValue(10)
  setValue((previous) => previous + 2)
  expect(value()).toBe(1)
  await vi.advanceTimersByTimeAsync(100)
  await flush()
  expect(value()).toBe(3)
  setValue(20)
  utility.cancel()
  await vi.runAllTimersAsync()
  expect(value()).toBe(3)
  destroy()
})
it('tracks source values without recreating the utility', async () => {
  const input = source('first')
  const {
    result: [value, utility],
    destroy,
  } = setup(() => createDebouncedValue(input.get, { wait: 100 }))
  await flush()
  input.set('second')
  await flush()
  expect(value()).toBe('first')
  await vi.advanceTimersByTimeAsync(100)
  await flush()
  expect(value()).toBe('second')
  expect(utility.options.wait).toBe(100)
  destroy()
  input.set('disposed')
  await flush()
  await vi.runAllTimersAsync()
  expect(value()).toBe('second')
})
it('exposes pending items and drains the queue in order', async () => {
  const calls: Array<string> = []
  const {
    result: [items, add, queue],
    destroy,
  } = setup(() =>
    createQueuedSignal(
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
  } = setup(() => createQueuedValue(input.get, { started: false }))
  await flush()
  input.set(second)
  await flush()
  queue.start()
  await vi.runAllTimersAsync()
  await flush()
  expect(value()).toBe(second)
  destroy()
})
