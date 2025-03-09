import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Throttler } from '../src/throttler'

describe('Throttler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should execute immediately with default options', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle()
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute more than once within the wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle()
    throttler.throttle()
    throttler.throttle()

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute with trailing edge after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle('first')
    throttler.throttle('second')
    throttler.throttle('third')

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

    throttler.throttle()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should not execute on trailing edge when trailing is false', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100, trailing: false })

    throttler.throttle('first')
    throttler.throttle('second')

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute again after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle('first')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttler.throttle('second')
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should track execution count correctly', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle()
    expect(throttler.getExecutionCount()).toBe(1)

    throttler.throttle()
    expect(throttler.getExecutionCount()).toBe(1)

    vi.advanceTimersByTime(100)
    expect(throttler.getExecutionCount()).toBe(2)
  })

  it('should cancel pending trailing execution', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.throttle('first')
    throttler.throttle('second')

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
    throttler.throttle('a')
    throttler.throttle('b')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('a')

    // Advance halfway
    vi.advanceTimersByTime(50)
    throttler.throttle('c')
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Complete first wait period
    vi.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('c')

    // New execution after wait period
    vi.advanceTimersByTime(100)
    throttler.throttle('d')
    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(mockFn).toHaveBeenLastCalledWith('d')
  })
})
