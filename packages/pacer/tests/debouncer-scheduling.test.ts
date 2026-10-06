import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Debouncer } from '../src/debouncer'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('tracks actual execution across reset without changing reset-to-flush semantics', () => {
  const execute = vi.fn()
  const debouncer = new Debouncer(execute, { wait: 100 })
  debouncer.maybeExecute('value')
  debouncer.reset()
  expect(debouncer.store.state.isPending).toBe(false)
  expect(debouncer.getIsScheduled()).toBe(true)
  debouncer.flush()
  expect(execute).not.toHaveBeenCalled()
  vi.advanceTimersByTime(100)
  expect(execute).toHaveBeenCalledWith('value')
  expect(debouncer.getIsScheduled()).toBe(false)
})

it('excludes leading cooldowns and clears their displayed pending state', () => {
  const execute = vi.fn()
  const debouncer = new Debouncer(execute, { wait: 100, leading: true })
  debouncer.maybeExecute()
  expect(debouncer.getIsScheduled()).toBe(false)
  vi.advanceTimersByTime(100)
  expect(debouncer.store.state.isPending).toBe(false)
  expect(execute).toHaveBeenCalledTimes(1)
})

it.each(['fn', 'onExecute'] as const)(
  'preserves reentrant schedules from %s',
  (boundary) => {
    const values: Array<string> = []
    const scheduleNext = (value: string) => {
      if (value === 'first') debouncer.maybeExecute('second')
    }
    const debouncer = new Debouncer(
      (value: string) => {
        values.push(value)
        if (boundary === 'fn') scheduleNext(value)
      },
      {
        wait: 100,
        onExecute: ([value]) => {
          if (boundary === 'onExecute') scheduleNext(value)
        },
      },
    )
    debouncer.maybeExecute('first')
    vi.advanceTimersByTime(100)
    expect(debouncer.getIsScheduled()).toBe(true)
    expect(debouncer.store.state.isPending).toBe(true)
    expect(debouncer.store.state.lastArgs).toEqual(['second'])
    vi.advanceTimersByTime(100)
    expect(values).toEqual(['first', 'second'])
    expect(debouncer.getIsScheduled()).toBe(false)
  },
)

it.each(['fn', 'onExecute'] as const)(
  'releases scheduled work when %s throws',
  (boundary) => {
    const fail = () => {
      throw new Error('failure')
    }
    const debouncer = new Debouncer(boundary === 'fn' ? fail : () => {}, {
      wait: 100,
      onExecute: boundary === 'onExecute' ? fail : undefined,
    })
    debouncer.maybeExecute()
    expect(() => vi.advanceTimersByTime(100)).toThrow('failure')
    expect(debouncer.getIsScheduled()).toBe(false)
    expect(debouncer.store.state.isPending).toBe(false)
  },
)

it('accounts for current trailing options and releases cancellation or disabling', () => {
  const debouncer = new Debouncer(() => {}, { wait: 100, trailing: false })
  debouncer.maybeExecute()
  expect(debouncer.getIsScheduled()).toBe(false)
  debouncer.setOptions({ trailing: true })
  expect(debouncer.getIsScheduled()).toBe(true)
  debouncer.cancel()
  expect(debouncer.getIsScheduled()).toBe(false)
  debouncer.maybeExecute()
  debouncer.setOptions({ enabled: false })
  expect(debouncer.getIsScheduled()).toBe(false)
})

it('does not retain a cleared timer when the next wait calculation throws', () => {
  const debouncer = new Debouncer(() => {}, { wait: 100 })
  debouncer.maybeExecute()
  debouncer.setOptions({
    wait: () => {
      throw new Error('wait failed')
    },
  })
  expect(() => debouncer.maybeExecute()).toThrow('wait failed')
  expect(debouncer.getIsScheduled()).toBe(false)
})

it('preserves reentrant work during flush so another flush can execute it', () => {
  const values: Array<string> = []
  const debouncer = new Debouncer(
    (value: string) => {
      values.push(value)
      if (value === 'first') debouncer.maybeExecute('second')
    },
    { wait: 100 },
  )
  debouncer.maybeExecute('first')
  debouncer.flush()
  expect(debouncer.getIsScheduled()).toBe(true)
  expect(debouncer.store.state.isPending).toBe(true)
  expect(debouncer.store.state.lastArgs).toEqual(['second'])
  debouncer.flush()
  expect(values).toEqual(['first', 'second'])
  expect(debouncer.getIsScheduled()).toBe(false)
})

it('clears displayed pending work when a flushed callback throws', () => {
  const debouncer = new Debouncer(
    () => {
      throw new Error('flush failed')
    },
    { wait: 100 },
  )
  debouncer.maybeExecute()
  expect(() => debouncer.flush()).toThrow('flush failed')
  expect(debouncer.getIsScheduled()).toBe(false)
  expect(debouncer.store.state.isPending).toBe(false)
})
