import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Debouncer, debounce } from '../src/debouncer'

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

  it('should handle case where both leading and trailing are false', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: false,
      trailing: false,
    })

    debouncer.maybeExecute('test')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).not.toBeCalled()

    // Should still reset canLeadingExecute flag
    debouncer.maybeExecute('test2')
    expect(mockFn).not.toBeCalled()
  })

  it('should properly handle canLeadingExecute flag after cancellation', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    // First call - executes immediately
    debouncer.maybeExecute('first')
    expect(mockFn).toBeCalledTimes(1)

    // Cancel before wait expires
    vi.advanceTimersByTime(500)
    debouncer.cancel()

    // Should be able to execute immediately again after cancellation
    debouncer.maybeExecute('second')
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should handle rapid calls with leading edge execution', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    // Make rapid calls
    debouncer.maybeExecute('first')
    debouncer.maybeExecute('second')
    debouncer.maybeExecute('third')
    debouncer.maybeExecute('fourth')

    // Only first call should execute immediately
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    // Wait for timeout
    vi.advanceTimersByTime(1000)

    // Next call should execute immediately
    debouncer.maybeExecute('fifth')
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('fifth')
  })

  it('should not execute when enabled is false', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      enabled: false,
    })

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(1000)
    expect(mockFn).not.toBeCalled()
  })

  it('should not execute leading edge when disabled', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      enabled: false,
    })

    debouncer.maybeExecute('test')
    expect(mockFn).not.toBeCalled()
    vi.advanceTimersByTime(1000)
    expect(mockFn).not.toBeCalled()
  })

  it('should default to enabled', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
    })

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('test')
  })

  it('should allow enabling/disabling after construction', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    // Start enabled by default
    debouncer.maybeExecute('first')
    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    // Disable and verify no execution
    debouncer.setOptions({ enabled: false })
    debouncer.maybeExecute('second')
    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1) // Still only called once

    // Re-enable and verify execution resumes
    debouncer.setOptions({ enabled: true })
    debouncer.maybeExecute('third')
    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('third')
  })

  it('should allow disabling mid-wait', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test')
    vi.advanceTimersByTime(500) // Half-way through wait
    debouncer.setOptions({ enabled: false })
    vi.advanceTimersByTime(500) // Complete wait
    expect(mockFn).not.toBeCalled()
  })

  it('should allow updating multiple options at once', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    // Update both wait time and leading option
    debouncer.setOptions({ wait: 500, leading: true })

    // Verify new leading behavior
    debouncer.maybeExecute('test')
    expect(mockFn).toBeCalledTimes(1) // Immediate execution due to leading: true

    // Verify new wait time
    vi.advanceTimersByTime(500) // Only need to wait 500ms now
    expect(mockFn).toBeCalledTimes(2) // Trailing execution after shorter wait
  })

  it('should update isDebouncing properly when trailing-only', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      trailing: true,
      leading: false,
    })

    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(true)

    // Call again before wait expires
    vi.advanceTimersByTime(500)
    debouncer.maybeExecute('test') // Should reset isDebouncing

    // Time is almost up
    vi.advanceTimersByTime(900)
    expect(debouncer.getIsPending()).toBe(true) // Still debouncing

    vi.advanceTimersByTime(100)
    expect(debouncer.getIsPending()).toBe(false) // Now it's done
  })

  it('should update isDebouncing properly when leading-only', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    // Firs call executes immediately
    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(false)

    // Call again before wait expires
    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(true) // Should be debouncing now

    // Time is almost up
    vi.advanceTimersByTime(900)
    expect(debouncer.getIsPending()).toBe(true) // Still debouncing

    vi.advanceTimersByTime(100)
    expect(debouncer.getIsPending()).toBe(false) // Now it's done
  })

  it('should not be isDebouncing when disabled', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000, enabled: false })

    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(debouncer.getIsPending()).toBe(false)
  })

  it('should update isDebouncing properly when enabling/disabling', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(true)

    // Disable while there is a pending execution
    debouncer.setOptions({ enabled: false })
    expect(debouncer.getIsPending()).toBe(false) // Should be false now

    // Re-enable
    debouncer.setOptions({ enabled: true })
    expect(debouncer.getIsPending()).toBe(false) // Should still be false
  })

  it('should set isDebouncing to false when canceled', () => {
    const mockFn = vi.fn()
    const debouncer = new Debouncer(mockFn, { wait: 1000 })

    debouncer.maybeExecute('test')
    expect(debouncer.getIsPending()).toBe(true)

    debouncer.cancel()
    expect(debouncer.getIsPending()).toBe(false)
  })
})

describe('debounce helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a debounced function with default options', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, { wait: 1000 })

    debouncedFn('test')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('test')
  })

  it('should pass arguments correctly', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, { wait: 1000 })

    debouncedFn(42, 'test', { foo: 'bar' })
    vi.advanceTimersByTime(1000)

    expect(mockFn).toBeCalledWith(42, 'test', { foo: 'bar' })
  })

  it('should respect leading option', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, {
      wait: 1000,
      leading: true,
      trailing: false,
    })

    debouncedFn('first')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    debouncedFn('second')
    expect(mockFn).toBeCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)

    debouncedFn('third')
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('third')
  })

  it('should handle multiple calls with trailing edge', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, { wait: 1000 })

    debouncedFn('a')
    debouncedFn('b')
    debouncedFn('c')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(500)
    debouncedFn('d')
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('d')
  })

  it('should support both leading and trailing execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, {
      wait: 1000,
      leading: true,
    })

    debouncedFn('first')
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith('first')

    debouncedFn('second')
    expect(mockFn).toBeCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(mockFn).toBeCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })
})
