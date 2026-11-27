import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Debouncer } from '../src/debouncer'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it.each([0, 50])(
  'flush does not repeat an already consumed leading call with wait %i',
  (wait) => {
    const fn = vi.fn()
    const debouncer = new Debouncer(fn, { leading: true, trailing: true, wait })
    debouncer.maybeExecute('first')
    debouncer.flush()
    expect(fn.mock.calls).toEqual([['first']])
    vi.advanceTimersByTime(50)
    expect(fn.mock.calls).toEqual([['first']])
  },
)

it('returns to idle after a single leading call', () => {
  const fn = vi.fn()
  const debouncer = new Debouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
  })
  debouncer.maybeExecute('first')
  vi.advanceTimersByTime(50)
  expect.soft(debouncer.store.state.isPending).toBe(false)
  expect.soft(debouncer.store.state.status).toBe('idle')
  expect.soft(debouncer.store.state.lastArgs).toBeUndefined()
  debouncer.flush()
  expect(fn.mock.calls).toEqual([['first']])
})

it('a no-op flush keeps the cooldown and later flushes only new arguments', () => {
  const fn = vi.fn()
  const debouncer = new Debouncer(fn, {
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
  const debouncer = new Debouncer(fn, {
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
  const debouncer = new Debouncer(fn, {
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
  const debouncer = new Debouncer(fn, {
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

it('reports pending state only for a subsequent trailing call', () => {
  const fn = vi.fn()
  const debouncer = new Debouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
  })
  debouncer.maybeExecute('first')
  expect(debouncer.store.state.isPending).toBe(false)
  expect(debouncer.store.state.lastArgs).toBeUndefined()
  expect(debouncer.store.state.canLeadingExecute).toBe(false)
  debouncer.maybeExecute('second')
  expect(debouncer.store.state.isPending).toBe(true)
  expect(debouncer.store.state.lastArgs).toEqual(['second'])
  vi.advanceTimersByTime(50)
  expect(fn.mock.calls).toEqual([['first'], ['second']])
  expect(debouncer.store.state.isPending).toBe(false)
  expect(debouncer.store.state.status).toBe('idle')
})

it('uses functional wait for later trailing calls', () => {
  const fn = vi.fn()
  let wait = 50
  const debouncer = new Debouncer(fn, {
    leading: true,
    trailing: true,
    wait: () => wait,
  })
  debouncer.maybeExecute('first')
  debouncer.flush()
  vi.advanceTimersByTime(25)
  wait = 100
  debouncer.maybeExecute('second')
  vi.advanceTimersByTime(99)
  expect(fn.mock.calls).toEqual([['first']])
  vi.advanceTimersByTime(1)
  expect(fn.mock.calls).toEqual([['first'], ['second']])
  debouncer.flush()
  expect(fn.mock.calls).toEqual([['first'], ['second']])
})

it('respects functional enabled before leading execution and after disabling', () => {
  const fn = vi.fn()
  let enabled = false
  const debouncer = new Debouncer(fn, {
    leading: true,
    trailing: true,
    wait: 50,
    enabled: () => enabled,
  })
  debouncer.maybeExecute('disabled')
  enabled = true
  debouncer.maybeExecute('first')
  debouncer.maybeExecute('cancelled')
  enabled = false
  debouncer.setOptions({})
  debouncer.flush()
  vi.advanceTimersByTime(50)
  expect(fn.mock.calls).toEqual([['first']])
  enabled = true
  debouncer.maybeExecute('next')
  debouncer.flush()
  vi.advanceTimersByTime(50)
  expect(fn.mock.calls).toEqual([['first'], ['next']])
})
