import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Throttler } from '../src/throttler'

describe('Throttler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should execute immediately with default options', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute()
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute more than once within the wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute()
    throttler.execute()
    throttler.execute()

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute with trailing edge after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute('first')
    throttler.execute('second')
    throttler.execute('third')

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('third')
  })

  it('should not execute when leading and trailing are false', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, {
      wait: 100,
      leading: false,
      trailing: false,
    })

    throttler.execute()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should not execute on trailing edge when trailing is false', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100, trailing: false })

    throttler.execute('first')
    throttler.execute('second')

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute again after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttler.execute('second')
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should track execution count correctly', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute()
    expect(throttler.getExecutionCount()).toBe(1)

    throttler.execute()
    expect(throttler.getExecutionCount()).toBe(1)

    vi.advanceTimersByTime(100)
    expect(throttler.getExecutionCount()).toBe(2)
  })

  it('should cancel pending trailing execution', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.execute('first')
    throttler.execute('second')

    expect(mockFn).toHaveBeenCalledTimes(1)

    throttler.cancel()
    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')
  })

  it('should handle multiple executions with proper timing', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    // First burst
    throttler.execute('a')
    throttler.execute('b')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('a')

    // Advance halfway
    vi.advanceTimersByTime(50)
    throttler.execute('c')
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Complete first wait period
    vi.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('c')

    // New execution after wait period
    vi.advanceTimersByTime(100)
    throttler.execute('d')
    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(mockFn).toHaveBeenLastCalledWith('d')
  })
})
