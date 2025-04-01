import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Throttler, throttle } from '../src/throttler'

describe('Throttler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should execute immediately with default options', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute()
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute more than once within the wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute()
    throttler.maybeExecute()
    throttler.maybeExecute()

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute with trailing edge after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute('first')
    throttler.maybeExecute('second')
    throttler.maybeExecute('third')

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

    throttler.maybeExecute()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should not execute on trailing edge when trailing is false', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100, trailing: false })

    throttler.maybeExecute('first')
    throttler.maybeExecute('second')

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute again after wait period', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttler.maybeExecute('second')
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should track execution count correctly', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute()
    expect(throttler.getExecutionCount()).toBe(1)

    throttler.maybeExecute()
    expect(throttler.getExecutionCount()).toBe(1)

    vi.advanceTimersByTime(100)
    expect(throttler.getExecutionCount()).toBe(2)
  })

  it('should cancel pending trailing execution', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    throttler.maybeExecute('first')
    throttler.maybeExecute('second')

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
    throttler.maybeExecute('a')
    throttler.maybeExecute('b')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('a')

    // Advance halfway
    vi.advanceTimersByTime(50)
    throttler.maybeExecute('c')
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Complete first wait period
    vi.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('c')

    // New execution after wait period
    vi.advanceTimersByTime(100)
    throttler.maybeExecute('d')
    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(mockFn).toHaveBeenLastCalledWith('d')
  })

  it('should track last execution time correctly', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    // Initial state
    expect(throttler.getLastExecutionTime()).toBe(0)

    // First execution
    throttler.maybeExecute('first')
    const firstExecutionTime = throttler.getLastExecutionTime()
    expect(firstExecutionTime).toBeGreaterThan(0)

    // Wait and execute again
    vi.advanceTimersByTime(100)
    throttler.maybeExecute('second')
    const secondExecutionTime = throttler.getLastExecutionTime()
    expect(secondExecutionTime).toBeGreaterThan(firstExecutionTime)
  })

  it('should handle zero wait time correctly', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 0 })

    // Should execute immediately due to leading: true
    throttler.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    // Should execute immediately again since wait is 0
    throttler.maybeExecute('second')
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should handle very large wait times', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 1000000 }) // 1000 seconds

    // First call should execute immediately
    throttler.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    // Subsequent calls should be throttled
    throttler.maybeExecute('second')
    throttler.maybeExecute('third')
    expect(mockFn).toBeCalledTimes(1)

    // Advance time by half the wait period
    vi.advanceTimersByTime(500000)
    expect(mockFn).toBeCalledTimes(1)

    // Complete the wait period
    vi.advanceTimersByTime(500000)
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('third')
  })

  it('should handle cancellation with pending trailing execution', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    // First call executes immediately
    throttler.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)

    // Second call during wait period
    throttler.maybeExecute('second')
    expect(mockFn).toBeCalledTimes(1)

    // Cancel before trailing execution
    throttler.cancel()

    // Advance time - trailing execution should not occur
    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')
  })

  it('should handle multiple cancellations', () => {
    const mockFn = vi.fn()
    const throttler = new Throttler(mockFn, { wait: 100 })

    // First call
    throttler.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)

    // Cancel before trailing execution
    throttler.cancel()
    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(1)

    // Second call
    throttler.maybeExecute('second')
    expect(mockFn).toBeCalledTimes(2)

    // Cancel again
    throttler.cancel()
    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(2)
  })
})

describe('throttle helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a throttled function with default options', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, { wait: 100 })

    throttledFn('test')
    expect(mockFn).toBeCalledTimes(1) // Leading edge
    expect(mockFn).toBeCalledWith('test')

    throttledFn('ignored')
    expect(mockFn).toBeCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(2) // Trailing edge
    expect(mockFn).toHaveBeenLastCalledWith('ignored')
  })

  it('should pass arguments correctly', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, { wait: 100 })

    throttledFn(42, 'test', { foo: 'bar' })
    expect(mockFn).toBeCalledWith(42, 'test', { foo: 'bar' })
  })

  it('should respect leading: false option', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, {
      wait: 100,
      leading: false,
      trailing: true,
    })

    throttledFn('first')
    expect(mockFn).not.toBeCalled() // No leading edge execution

    throttledFn('second') // Add another call to ensure trailing edge triggers

    // Need to advance time by wait period to trigger trailing edge
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1) // Trailing edge only
    expect(mockFn).toHaveBeenCalledWith('second') // Should get last call
  })

  it('should respect trailing: false option', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, {
      wait: 100,
      leading: true,
      trailing: false,
    })

    throttledFn('first')
    expect(mockFn).toBeCalledTimes(1) // Leading edge

    throttledFn('second')
    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(1) // No trailing edge
    expect(mockFn).toHaveBeenCalledWith('first')
  })

  it('should handle multiple calls with proper timing', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, { wait: 100 })

    // First burst
    throttledFn('a')
    throttledFn('b')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('a')

    // Advance halfway and make another call
    vi.advanceTimersByTime(50)
    throttledFn('c')
    expect(mockFn).toBeCalledTimes(1)

    // Complete first wait period
    vi.advanceTimersByTime(50)
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('c')

    // Wait another period and make new call
    vi.advanceTimersByTime(100)
    throttledFn('d')
    expect(mockFn).toBeCalledTimes(3)
    expect(mockFn).toHaveBeenLastCalledWith('d')
  })

  it('should handle rapid successive calls', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, { wait: 100 })

    // Rapid succession of calls
    for (let i = 0; i < 5; i++) {
      throttledFn(`call-${i}`)
    }
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('call-0')

    // Should execute the last call after wait
    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('call-4')
  })

  it('should work with both leading and trailing disabled', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, {
      wait: 100,
      leading: false,
      trailing: false,
    })

    throttledFn('test')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).not.toBeCalled()
  })
})
