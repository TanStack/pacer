import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncDebouncer } from '../src/async-debouncer'

describe('AsyncDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should delay execution until after wait period', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    const promise = debouncer.maybeExecute('first')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    await promise
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should reset timer on subsequent calls', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    debouncer.maybeExecute('first')
    vi.advanceTimersByTime(50)

    debouncer.maybeExecute('second')
    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should track execution count correctly', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    const promise1 = debouncer.maybeExecute()
    expect(debouncer.getExecutionCount()).toBe(0)

    vi.advanceTimersByTime(100)
    await promise1
    expect(debouncer.getExecutionCount()).toBe(1)

    const promise2 = debouncer.maybeExecute()
    vi.advanceTimersByTime(100)
    await promise2
    expect(debouncer.getExecutionCount()).toBe(2)
  })

  it('should handle errors with onError callback', async () => {
    const error = new Error('Test error')
    const mockFn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100, onError })

    const promise = debouncer.maybeExecute()
    vi.advanceTimersByTime(100)
    await promise
    expect(onError).toHaveBeenCalledWith(error, debouncer)
  })

  it('should ignore errors in onError callback', async () => {
    const error = new Error('Test error')
    const mockFn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn().mockRejectedValue(new Error('Error handler error'))
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100, onError })

    const promise = debouncer.maybeExecute()
    vi.advanceTimersByTime(100)
    await expect(promise).resolves.not.toThrow()
  })

  it('should cancel pending execution', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(50)
    debouncer.cancel()

    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should allow new executions after cancel', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    debouncer.maybeExecute('first')
    vi.advanceTimersByTime(50)
    debouncer.cancel()

    debouncer.maybeExecute('second')
    vi.advanceTimersByTime(100)
    await Promise.resolve()

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('second')
  })

  it('should handle multiple rapid calls', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    debouncer.maybeExecute('first')
    vi.advanceTimersByTime(20)
    debouncer.maybeExecute('second')
    vi.advanceTimersByTime(20)
    debouncer.maybeExecute('third')
    vi.advanceTimersByTime(20)
    debouncer.maybeExecute('fourth')

    vi.advanceTimersByTime(100)
    await Promise.resolve()

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('fourth')
  })

  it('should handle long-running functions', async () => {
    let resolveFirst: (value: unknown) => void
    const firstCall = new Promise((resolve) => {
      resolveFirst = resolve
    })

    const mockFn = vi.fn().mockImplementation(() => firstCall)
    const debouncer = new AsyncDebouncer(mockFn, { wait: 100 })

    const promise = debouncer.maybeExecute('test')
    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
    resolveFirst!({})
    await promise

    // Subsequent call should work
    debouncer.maybeExecute('next')
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
