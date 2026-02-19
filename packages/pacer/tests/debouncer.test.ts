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

  describe('Flush Method', () => {
    it('should execute pending function immediately', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(mockFn).not.toBeCalled()

      debouncer.flush()
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test')
    })

    it('should clear pending timeout when flushing', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      debouncer.flush()

      // Advance time to ensure timeout would have fired
      vi.advanceTimersByTime(1000)

      expect(mockFn).toBeCalledTimes(1)
    })

    it('should do nothing when no pending execution', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.flush()
      expect(mockFn).not.toBeCalled()
    })

    it('should work with leading and trailing execution', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      debouncer.maybeExecute('second')
      debouncer.flush()

      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })

    it('should not work with leading-only execution because there would be no trailing execution to flush', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      debouncer.maybeExecute('second')
      debouncer.flush()

      // With leading: true, trailing: false, flush should NOT cause another call
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toHaveBeenLastCalledWith('first')
    })

    it('should update state correctly after flush', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(debouncer.store.state.isPending).toBe(true)
      expect(debouncer.store.state.executionCount).toBe(0)

      debouncer.flush()
      expect(debouncer.store.state.isPending).toBe(false)
      expect(debouncer.store.state.executionCount).toBe(1)
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

      expect(debouncer.store.state.executionCount).toBe(0)

      debouncer.maybeExecute('test')
      vi.advanceTimersByTime(1000)
      expect(debouncer.store.state.executionCount).toBe(1)

      debouncer.maybeExecute('test')
      vi.advanceTimersByTime(1000)
      expect(debouncer.store.state.executionCount).toBe(2)
    })

    it('should track execution count with leading and trailing', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
      })

      expect(debouncer.store.state.executionCount).toBe(0)

      debouncer.maybeExecute('test')
      debouncer.maybeExecute('test2')
      expect(debouncer.store.state.executionCount).toBe(1) // Leading execution

      vi.advanceTimersByTime(1000)
      expect(debouncer.store.state.executionCount).toBe(2) // Trailing execution
    })

    it('should not increment count when execution is cancelled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      debouncer.cancel()
      vi.advanceTimersByTime(1000)

      expect(debouncer.store.state.executionCount).toBe(0)
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
      expect(debouncer.store.state.isPending).toBe(true)

      // Call again before wait expires
      vi.advanceTimersByTime(500)
      debouncer.maybeExecute('test') // Should reset pending

      // Time is almost up
      vi.advanceTimersByTime(900)
      expect(debouncer.store.state.isPending).toBe(true) // Still pending

      vi.advanceTimersByTime(100)
      expect(debouncer.store.state.isPending).toBe(false) // Now it's done
    })

    it('should never be pending when trailing is false', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      debouncer.maybeExecute('test1')
      expect(debouncer.store.state.isPending).toBe(false)

      // Call again before wait expires
      vi.advanceTimersByTime(500)
      debouncer.maybeExecute('test2')

      // Time is almost up
      vi.advanceTimersByTime(900)
      expect(debouncer.store.state.isPending).toBe(false)

      vi.advanceTimersByTime(100)
      expect(debouncer.store.state.isPending).toBe(false)
    })

    it('should not be pending when leading and trailing are both false', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        leading: false,
        trailing: false,
      })

      debouncer.maybeExecute('test')
      expect(debouncer.store.state.isPending).toBe(false)

      vi.advanceTimersByTime(1000)
      expect(debouncer.store.state.isPending).toBe(false)
    })

    it('should not be pending when disabled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000, enabled: false })

      debouncer.maybeExecute('test')
      expect(debouncer.store.state.isPending).toBe(false)

      vi.advanceTimersByTime(1000)
      expect(debouncer.store.state.isPending).toBe(false)
    })

    it('should update pending when enabling/disabling', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(debouncer.store.state.isPending).toBe(true)

      // Disable while there is a pending execution
      debouncer.setOptions({ enabled: false })
      expect(debouncer.store.state.isPending).toBe(false) // Should be false now

      // Re-enable
      debouncer.setOptions({ enabled: true })
      expect(debouncer.store.state.isPending).toBe(false) // Should still be false
    })

    it('should set pending to false when canceled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(debouncer.store.state.isPending).toBe(true)

      debouncer.cancel()
      expect(debouncer.store.state.isPending).toBe(false)
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
      expect(onExecute).toBeCalledWith([], debouncer)
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
      expect(onExecute).toBeCalledWith([], debouncer)

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
      expect(onExecute).toBeCalledWith([], debouncer)
      expect(onExecute.mock.calls[0]?.[1]).toBe(debouncer)
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
  })

  describe('maxWait Option', () => {
    it('should execute via normal trailing debounce when burst ends before maxWait', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      // Call rapidly every 100ms
      debouncer.maybeExecute('call1')
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('call2')
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('call3')
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('call4')
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('call5')

      // At 400ms, no execution yet
      expect(mockFn).not.toBeCalled()

      // Advance past wait time (debounce fires at 900ms)
      vi.advanceTimersByTime(600)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toHaveBeenLastCalledWith('call5')
    })

    it('should not execute before maxWait and should use most recent args when it fires', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      debouncer.maybeExecute('first') // t=0, starts maxWait timer for t=1000
      vi.advanceTimersByTime(300) // t=300
      debouncer.maybeExecute('second') // resets wait to t=800, maxWait unchanged
      vi.advanceTimersByTime(300) // t=600
      debouncer.maybeExecute('third') // resets wait to t=1100, maxWait still t=1000

      vi.advanceTimersByTime(300) // t=900 (before maxWait)
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(100) // t=1000 (maxWait fires)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('third') // most recent args, not 'first'
      expect(debouncer.store.state.executionCount).toBe(1)
    })

    it('should execute at wait time when calls stop before maxWait', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      // Make a call then stop
      debouncer.maybeExecute('call')
      expect(mockFn).not.toBeCalled()

      // Advance to wait time (500ms)
      vi.advanceTimersByTime(500)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('call')

      // Advance to maxWait time (1000ms) - should not execute again
      vi.advanceTimersByTime(500)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should force execution at maxWait intervals with continuous calls', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      // Call continuously for 2.5 seconds
      for (let i = 0; i < 25; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute at ~1000ms and ~2000ms
      expect(mockFn).toBeCalledTimes(2)
    })

    it('should work with leading edge execution', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
        leading: true,
      })

      // First call executes immediately (leading)
      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Continue calling rapidly
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('second')
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('third')

      // At 200ms, still only 1 execution (the leading one)
      expect(mockFn).toBeCalledTimes(1)

      // Advance to 1000ms (maxWait from first call)
      vi.advanceTimersByTime(800)
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('third')
    })

    it('should work with trailing edge disabled', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
        leading: true,
        trailing: false,
      })

      // First call executes immediately
      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      // Continue calling rapidly
      for (let i = 0; i < 10; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // At 1000ms, maxWait forces execution
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('call9')
    })

    it('should clear maxWait timer on flush', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      debouncer.maybeExecute('test')
      expect(mockFn).not.toBeCalled()

      // Flush before maxWait
      vi.advanceTimersByTime(300)
      debouncer.flush()
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test')

      // Advance to maxWait time - should not execute again
      vi.advanceTimersByTime(700)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should flush correctly after maxWait has already fired during a burst', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      // Continuous calls for 12 iterations at 100ms
      for (let i = 0; i < 12; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }
      // maxWait fires at t=1000; loop ends at t=1200
      expect(mockFn).toBeCalledTimes(1)

      debouncer.maybeExecute('post-maxwait-1') // new burst starts
      vi.advanceTimersByTime(100)
      debouncer.maybeExecute('post-maxwait-2')
      expect(debouncer.store.state.isPending).toBe(true)

      debouncer.flush()
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('post-maxwait-2')

      vi.advanceTimersByTime(1500) // verify no more fires
      expect(mockFn).toBeCalledTimes(2)
    })

    it('should clear maxWait timer on cancel', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      debouncer.maybeExecute('test')
      expect(mockFn).not.toBeCalled()

      // Cancel before maxWait
      vi.advanceTimersByTime(300)
      debouncer.cancel()

      // Advance to maxWait time - should not execute
      vi.advanceTimersByTime(700)
      expect(mockFn).not.toBeCalled()
    })

    it('should clear maxWait timer when disabled and start fresh on re-enable', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      debouncer.maybeExecute('call1') // t=0, starts maxWait for t=1000
      vi.advanceTimersByTime(300) // t=300
      debouncer.maybeExecute('call2') // resets wait to t=800, maxWait running

      debouncer.setOptions({ enabled: false }) // cancel() clears both timers
      expect(mockFn).not.toBeCalled()
      expect(debouncer.store.state.isPending).toBe(false)

      vi.advanceTimersByTime(700) // t=1000, where maxWait WOULD have fired
      expect(mockFn).not.toBeCalled() // timer was cleared

      debouncer.setOptions({ enabled: true })
      debouncer.maybeExecute('fresh') // starts new maxWait
      vi.advanceTimersByTime(500) // wait fires
      expect(mockFn).toBeCalledTimes(1) // normal debounce fires
      expect(mockFn).toBeCalledWith('fresh')
    })

    it('should handle dynamic maxWait function', () => {
      const mockFn = vi.fn()
      let maxWaitValue = 1000
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: () => maxWaitValue,
      })

      // Call continuously
      for (let i = 0; i < 10; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute at 1000ms
      expect(mockFn).toBeCalledTimes(1)

      // Change maxWait value
      maxWaitValue = 500

      // Continue calling
      for (let i = 0; i < 5; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute again (total of 2 times now)
      expect(mockFn).toBeCalledTimes(2)
    })

    it('should handle maxWait less than wait', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        maxWait: 500,
      })

      // Call continuously
      for (let i = 0; i < 5; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // maxWait (500ms) should take precedence
      expect(mockFn).toBeCalledTimes(1)

      // Continue for another 500ms
      for (let i = 0; i < 5; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute again at next maxWait interval
      expect(mockFn).toBeCalledTimes(2)
    })

    it('should force execution on next tick when maxWait is 0', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        maxWait: 0,
      })

      debouncer.maybeExecute('immediate')
      expect(mockFn).not.toBeCalled() // setTimeout(0) is still async

      vi.advanceTimersByTime(0) // flush macrotask queue
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('immediate')

      vi.advanceTimersByTime(1000) // let wait timer fire if it exists
      expect(mockFn).toBeCalledTimes(1) // no double execution
    })

    it('should treat negative maxWait like 0 (fires on next tick)', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 1000,
        maxWait: -100,
      })

      debouncer.maybeExecute('negative')
      expect(mockFn).not.toBeCalled() // still async

      vi.advanceTimersByTime(0) // flush macrotask queue
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('negative')

      vi.advanceTimersByTime(1000) // let wait timer fire if it exists
      expect(mockFn).toBeCalledTimes(1) // no double execution
    })

    it('should work without maxWait (backward compatibility)', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
      })

      // Call continuously for 2 seconds
      for (let i = 0; i < 20; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // Without maxWait, should never execute during continuous calls
      expect(mockFn).not.toBeCalled()

      // Stop calling and wait
      vi.advanceTimersByTime(500)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should restart maxWait timer on new burst after completion', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
      })

      // First burst
      for (let i = 0; i < 10; i++) {
        debouncer.maybeExecute(`burst1-${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute at 1000ms
      expect(mockFn).toBeCalledTimes(1)

      // Wait for completion
      vi.advanceTimersByTime(500)
      expect(mockFn).toBeCalledTimes(1)

      // Second burst - maxWait timer should restart
      for (let i = 0; i < 10; i++) {
        debouncer.maybeExecute(`burst2-${i}`)
        vi.advanceTimersByTime(100)
      }

      // Should execute again at next maxWait interval
      expect(mockFn).toBeCalledTimes(2)
    })

    it('should handle maxWait with both leading and trailing', () => {
      const mockFn = vi.fn()
      const debouncer = new Debouncer(mockFn, {
        wait: 500,
        maxWait: 1000,
        leading: true,
        trailing: true,
      })

      // First call executes immediately (leading)
      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      // Continue calling rapidly
      for (let i = 0; i < 10; i++) {
        debouncer.maybeExecute(`call${i}`)
        vi.advanceTimersByTime(100)
      }

      // At 1000ms, maxWait forces execution
      expect(mockFn).toBeCalledTimes(2)

      // Make one more call to set up trailing, then wait for it
      debouncer.maybeExecute('trailing')
      vi.advanceTimersByTime(500)
      expect(mockFn).toBeCalledTimes(3)
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
