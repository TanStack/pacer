import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Debouncer, debounce } from '../src/debouncer'

describe('Debouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Debouncing', () => {
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
  })

  describe('Execution Edge Cases', () => {
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

      debouncer.maybeExecute('test1')
      debouncer.maybeExecute('test2')
      expect(mockFn).toBeCalledTimes(1) // Leading call

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(2) // Trailing call
    })

    it('should default to trailing-only execution', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test1')
      debouncer.maybeExecute('test2')
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test2')
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
  })

  describe('Execution Control', () => {
    it('should cancel pending execution', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute()
      debouncer.cancel()

      vi.advanceTimersByTime(1000)
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
  })

  describe('Enabled/Disabled State', () => {
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
  })

  describe('Options Management', () => {
    it('should allow updating multiple options at once', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      // Update both wait time and leading option
      debouncer.setOptions({ wait: 500, leading: true })

      // Verify new leading behavior
      debouncer.maybeExecute('test1')
      debouncer.maybeExecute('test2')
      expect(mockFn).toBeCalledTimes(1) // Immediate execution due to leading: true

      // Verify new wait time
      vi.advanceTimersByTime(500) // Only need to wait 500ms now
      expect(mockFn).toBeCalledTimes(2) // Trailing execution after shorter wait
    })
  })

  describe('State Tracking', () => {
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
      debouncer.maybeExecute('test2')
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

  describe('Pending State', () => {
    it('should update pending when trailing-only', () => {
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
      debouncer.maybeExecute('test') // Should reset pending

      // Time is almost up
      vi.advanceTimersByTime(900)
      expect(debouncer.getIsPending()).toBe(true) // Still pending

      vi.advanceTimersByTime(100)
      expect(debouncer.getIsPending()).toBe(false) // Now it's done
    })

    it('should never be pending when trailing is false', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      debouncer.maybeExecute('test1')
      expect(debouncer.getIsPending()).toBe(false)

      // Call again before wait expires
      vi.advanceTimersByTime(500)
      debouncer.maybeExecute('test2')

      // Time is almost up
      vi.advanceTimersByTime(900)
      expect(debouncer.getIsPending()).toBe(false)

      vi.advanceTimersByTime(100)
      expect(debouncer.getIsPending()).toBe(false)
    })

    it('should not be pending when leading and trailing are both false', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: false,
        trailing: false,
      })

      debouncer.maybeExecute('test')
      expect(debouncer.getIsPending()).toBe(false)

      vi.advanceTimersByTime(1000)
      expect(debouncer.getIsPending()).toBe(false)
    })

    it('should not be pending when disabled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000, enabled: false })

      debouncer.maybeExecute('test')
      expect(debouncer.getIsPending()).toBe(false)

      vi.advanceTimersByTime(1000)
      expect(debouncer.getIsPending()).toBe(false)
    })

    it('should update pending when enabling/disabling', () => {
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

    it('should set pending to false when canceled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(debouncer.getIsPending()).toBe(true)

      debouncer.cancel()
      expect(debouncer.getIsPending()).toBe(false)
    })
  })

  describe('onExecute Callback', () => {
    it('should call onExecute callback after execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        onExecute,
      })

      debouncer.maybeExecute()
      expect(onExecute).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(onExecute).toBeCalledTimes(1)
      expect(onExecute).toBeCalledWith(debouncer)
    })

    it('should call onExecute callback with leading execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
        onExecute,
      })

      debouncer.maybeExecute()
      expect(onExecute).toBeCalledTimes(1)
      expect(onExecute).toBeCalledWith(debouncer)

      vi.advanceTimersByTime(1000)
      expect(onExecute).toBeCalledTimes(1) // Should not be called again
    })

    it('should not call onExecute callback when disabled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        enabled: false,
        onExecute,
      })

      debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      expect(onExecute).not.toBeCalled()
    })

    it('should not call onExecute callback when cancelled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        onExecute,
      })

      debouncer.maybeExecute()
      debouncer.cancel()
      vi.advanceTimersByTime(1000)
      expect(onExecute).not.toBeCalled()
    })

    it('should call onExecute callback with correct debouncer instance', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        onExecute,
      })

      debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      expect(onExecute).toBeCalledWith(debouncer)
      expect(onExecute.mock.calls[0]?.[0]).toBe(debouncer)
    })

    it('should call onExecute callback after each execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        onExecute,
      })

      // First execution
      debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      expect(onExecute).toBeCalledTimes(1)

      // Second execution
      debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      expect(onExecute).toBeCalledTimes(2)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle wait time of 0', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 0 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle negative wait time by using 0', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: -1000 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle very large wait times', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: Number.MAX_SAFE_INTEGER })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(Number.MAX_SAFE_INTEGER)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle NaN wait time by using 0', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: NaN })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle undefined/null arguments', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute(undefined, null)
      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledWith(undefined, null)
    })

    it('should prevent memory leaks by clearing timeouts', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      // Create multiple pending executions
      debouncer.maybeExecute()
      debouncer.maybeExecute()
      debouncer.maybeExecute()

      // Cancel all pending executions
      debouncer.cancel()

      // Advance time to ensure no executions occur
      vi.advanceTimersByTime(1000)
      expect(mockFn).not.toBeCalled()
    })

    it('should handle rapid option changes', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      // Start execution
      debouncer.maybeExecute()

      // Rapidly change options
      debouncer.setOptions({ wait: 500 })
      debouncer.setOptions({ wait: 2000 })
      debouncer.setOptions({ wait: 1000 })

      // Should still execute after the last wait time
      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle rapid enable/disable cycles', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      // Start execution
      debouncer.maybeExecute()

      // Rapidly enable/disable
      debouncer.setOptions({ enabled: false })
      debouncer.setOptions({ enabled: true })
      debouncer.setOptions({ enabled: false })
      debouncer.setOptions({ enabled: true })

      // Should execute if last state was enabled
      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
    })
  })
})

describe('debounce helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
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
  })

  describe('Execution Options', () => {
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
})
