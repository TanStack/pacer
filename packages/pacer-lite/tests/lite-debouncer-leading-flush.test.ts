import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LiteDebouncer } from '../src/lite-debouncer'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it.each([0, 50])(
  'flush does not repeat an already consumed leading call with wait %i',
  (wait) => {
    const fn = vi.fn()
    const debouncer = new LiteDebouncer(fn, {
      leading: true,
      trailing: true,
      wait,
    })
    debouncer.maybeExecute('first')
    debouncer.flush()
    expect(fn.mock.calls).toEqual([['first']])
    vi.advanceTimersByTime(50)
    expect(fn.mock.calls).toEqual([['first']])
  },
)

it('a no-op flush keeps the cooldown and later flushes only new arguments', () => {
  const fn = vi.fn()
  const debouncer = new LiteDebouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
  })
  debouncer.maybeExecute('first')
  debouncer.flush()
  vi.advanceTimersByTime(25)
  debouncer.maybeExecute('second')
  debouncer.maybeExecute('latest')
  expect(fn.mock.calls).toEqual([['first']])
  debouncer.flush()
  expect(fn.mock.calls).toEqual([['first'], ['latest']])
  debouncer.flush()
  vi.advanceTimersByTime(100)
  expect(fn.mock.calls).toEqual([['first'], ['latest']])
})

it('allows the next leading call after an unused trailing timer expires', () => {
  const fn = vi.fn()
  const debouncer = new LiteDebouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
  })
  debouncer.maybeExecute('first')
  vi.advanceTimersByTime(50)
  debouncer.maybeExecute('next')
  debouncer.flush()
  vi.advanceTimersByTime(50)
  expect(fn.mock.calls).toEqual([['first'], ['next']])
})

it('cancels a later trailing call and allows a new leading call', () => {
  const fn = vi.fn()
  const debouncer = new LiteDebouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
  })
  debouncer.maybeExecute('first')
  debouncer.maybeExecute('cancelled')
  debouncer.cancel()
  debouncer.flush()
  expect(fn.mock.calls).toEqual([['first']])
  debouncer.maybeExecute('next')
  debouncer.flush()
  vi.advanceTimersByTime(50)
  expect(fn.mock.calls).toEqual([['first'], ['next']])
})

it('executes only the latest trailing call in a zero-wait burst', () => {
  const fn = vi.fn()
  const debouncer = new LiteDebouncer(fn, {
    leading: true,
    trailing: true,
    wait: 0,
  })
  debouncer.maybeExecute('first')
  debouncer.maybeExecute('second')
  debouncer.maybeExecute('latest')
  expect(fn.mock.calls).toEqual([['first']])
  vi.advanceTimersByTime(0)
  expect(fn.mock.calls).toEqual([['first'], ['latest']])
  debouncer.flush()
  debouncer.maybeExecute('next')
  debouncer.flush()
  vi.advanceTimersByTime(0)
  expect(fn.mock.calls).toEqual([['first'], ['latest'], ['next']])
})
