import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Debouncer } from '../src/debouncer'

describe('Debouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not execute the function before the specified wait', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute()
    expect(mockFn).not.toBeCalled()
  })

  it('should execute the function after the specified wait', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute()
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
  })

  it('should debounce multiple calls', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute()
    debouncer.maybeExecute()
    debouncer.maybeExecute()
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
  })

  it('should pass arguments to the debounced function', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test', 123)
    vi.advanceTimersByTime(1000)

    expect(mockFn).toBeCalledWith('test', 123)
  })

  it('should cancel pending execution', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute()
    debouncer.cancel()

    vi.advanceTimersByTime(1000)
    expect(mockFn).not.toBeCalled()
  })

  it('should execute immediately with leading option', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    debouncer.maybeExecute('test')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('test')

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
  })

  it('should respect leading edge timing', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    // First call - executes immediately
    debouncer.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)

    // Call again before wait expires - should not execute
    vi.advanceTimersByTime(500)
    debouncer.maybeExecute('second')
    expect(mockFn).toBeCalledTimes(1)

    // Advance to end of second call's wait period - should not execute
    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)

    // Now that the full wait has passed since last call, this should execute
    debouncer.maybeExecute('third')
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('third')
  })

  it('should support both leading and trailing execution', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: true,
    })

    debouncer.maybeExecute('test')
    expect(mockFn).toBeCalledTimes(1) // Leading call

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(2) // Trailing call
  })

  it('should default to trailing-only execution', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('test')
  })

  it('should track execution count', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    expect(debouncer.getExecutionCount()).toBe(0)

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(1000)
    expect(debouncer.getExecutionCount()).toBe(1)

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(1000)
    expect(debouncer.getExecutionCount()).toBe(2)
  })

  it('should track execution count with leading and trailing', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: true,
    })

    expect(debouncer.getExecutionCount()).toBe(0)

    debouncer.maybeExecute('test')
    expect(debouncer.getExecutionCount()).toBe(1) // Leading execution

    vi.advanceTimersByTime(1000)
    expect(debouncer.getExecutionCount()).toBe(2) // Trailing execution
  })

  it('should not increment count when execution is cancelled', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test')
    debouncer.cancel()
    vi.advanceTimersByTime(1000)

    expect(debouncer.getExecutionCount()).toBe(0)
  })
})
