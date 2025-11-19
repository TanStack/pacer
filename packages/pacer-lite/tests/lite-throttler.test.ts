import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiteThrottler, liteThrottle } from '../src/lite-throttler'

describe('LiteThrottler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Throttling', () => {
    it('should execute immediately with default options', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not execute more than once within the wait period', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute()
      throttler.maybeExecute()
      throttler.maybeExecute()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should execute with trailing edge after wait period', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute('first')
      throttler.maybeExecute('second')
      throttler.maybeExecute('third')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenLastCalledWith('first')

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('third')
    })

    it('should execute again after wait period', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute('first')
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttler.maybeExecute('second')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })

    it('should pass arguments correctly', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute('test', 123, { foo: 'bar' })
      expect(mockFn).toHaveBeenCalledWith('test', 123, { foo: 'bar' })
    })
  })

  describe('Leading and Trailing Options', () => {
    it('should not execute when leading and trailing are false', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
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
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: true,
        trailing: false,
      })

      throttler.maybeExecute('first')
      throttler.maybeExecute('second')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not execute immediately when leading is false', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: false,
        trailing: true,
      })

      throttler.maybeExecute('test')
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('should default to both leading and trailing true when neither specified', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute('first')
      expect(mockFn).toHaveBeenCalledTimes(1) // Leading execution

      throttler.maybeExecute('second')
      expect(mockFn).toHaveBeenCalledTimes(1) // Still throttled

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(2) // Trailing execution
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })
  })

  describe('Timing and Multiple Executions', () => {
    it('should handle multiple executions with proper timing', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

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

    it('should handle zero wait time correctly', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 0 })

      // Should execute immediately due to leading: true
      throttler.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Should execute immediately again since wait is 0
      throttler.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })

    it('should handle negative wait time correctly', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: -100 })

      throttler.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      throttler.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(2) // Should execute immediately due to negative wait
    })

    it('should handle very large wait times', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 1000000 })

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
  })

  describe('Execution Control', () => {
    it('should cancel pending trailing execution', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute('first')
      throttler.maybeExecute('second')

      expect(mockFn).toHaveBeenCalledTimes(1)

      throttler.cancel()
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')
    })

    it('should handle multiple cancellations', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

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

  describe('Flush Method', () => {
    it('should execute pending function immediately', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 1000 })

      throttler.maybeExecute('test')
      expect(mockFn).toBeCalledTimes(1) // Leading execution

      throttler.maybeExecute('pending')
      expect(mockFn).toBeCalledTimes(1) // Still throttled

      throttler.flush()
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('pending')
    })

    it('should clear pending timeout when flushing', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 1000 })

      throttler.maybeExecute('first')
      throttler.maybeExecute('second')
      throttler.flush()

      // Advance time to ensure timeout would have fired
      vi.advanceTimersByTime(1000)

      expect(mockFn).toBeCalledTimes(2)
    })

    it('should do nothing when no pending execution', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 1000 })

      throttler.flush()
      expect(mockFn).not.toBeCalled()
    })

    it('should work with leading and trailing execution', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      throttler.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      throttler.maybeExecute('second')
      throttler.flush()

      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })

    it('should work with trailing-only execution', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 1000,
        leading: false,
        trailing: true,
      })

      throttler.maybeExecute('first')
      expect(mockFn).not.toBeCalled()

      throttler.flush()
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')
    })

    it('should not flush when leading only and no pending execution', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      throttler.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      // No pending execution to flush
      throttler.flush()
      expect(mockFn).toBeCalledTimes(1)
    })
  })

  describe('Callbacks', () => {
    it('should call onExecute after leading execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: true,
        onExecute,
      })

      throttler.maybeExecute('test')

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledWith(['test'], throttler)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute after trailing execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: false,
        trailing: true,
        onExecute,
      })

      throttler.maybeExecute('test')
      expect(onExecute).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledWith(['test'], throttler)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute with latest args after trailing execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: false,
        trailing: true,
        onExecute,
      })

      throttler.maybeExecute('first')
      throttler.maybeExecute('second')

      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledWith(['second'], throttler)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute after flush', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        onExecute,
      })

      throttler.maybeExecute('first') // Leading execution
      expect(onExecute).toHaveBeenCalledTimes(1)

      throttler.maybeExecute('second') // Pending for trailing
      throttler.flush()

      expect(mockFn).toHaveBeenCalledWith('second')
      expect(onExecute).toHaveBeenCalledWith(['second'], throttler)
      expect(onExecute).toHaveBeenCalledTimes(2)
    })

    it('should not call onExecute when cancelled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: false,
        trailing: true,
        onExecute,
      })

      throttler.maybeExecute('test')
      throttler.cancel()

      vi.advanceTimersByTime(100)

      expect(mockFn).not.toHaveBeenCalled()
      expect(onExecute).not.toHaveBeenCalled()
    })

    it('should work with both leading and trailing enabled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttler = new LiteThrottler(mockFn, {
        wait: 100,
        leading: true,
        trailing: true,
        onExecute,
      })

      throttler.maybeExecute('first')
      expect(onExecute).toHaveBeenCalledWith(['first'], throttler)

      throttler.maybeExecute('second')
      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledWith(['second'], throttler)
      expect(onExecute).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined/null arguments', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 100 })

      throttler.maybeExecute(undefined, null)
      expect(mockFn).toHaveBeenCalledWith(undefined, null)
    })

    it('should handle NaN wait time', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: NaN })

      // With NaN wait, timeSinceLastExecution >= NaN is false, so no leading execution
      // But trailing execution will be scheduled with NaN timeout duration
      throttler.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(0) // No leading execution

      // The trailing execution should happen with NaN timeout
      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')
    })

    it('should prevent memory leaks by clearing timeouts', () => {
      const mockFn = vi.fn()
      const throttler = new LiteThrottler(mockFn, { wait: 1000 })

      // Create pending execution
      throttler.maybeExecute('first')
      throttler.maybeExecute('second')

      // Cancel should clear timeout
      throttler.cancel()

      // Advance time to ensure no executions occur
      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1) // Only the leading execution
    })
  })
})

describe('liteThrottle helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a throttled function with default options', () => {
      const mockFn = vi.fn()
      const throttledFn = liteThrottle(mockFn, { wait: 100 })

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
      const throttledFn = liteThrottle(mockFn, { wait: 100 })

      throttledFn(42, 'test', { foo: 'bar' })
      expect(mockFn).toBeCalledWith(42, 'test', { foo: 'bar' })
    })
  })

  describe('Execution Options', () => {
    it('should respect leading: false option', () => {
      const mockFn = vi.fn()
      const throttledFn = liteThrottle(mockFn, {
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
      const throttledFn = liteThrottle(mockFn, {
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
      const throttledFn = liteThrottle(mockFn, { wait: 100 })

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
      const throttledFn = liteThrottle(mockFn, { wait: 100 })

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
      const throttledFn = liteThrottle(mockFn, {
        wait: 100,
        leading: false,
        trailing: false,
      })

      throttledFn('test')
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(100)
      expect(mockFn).not.toBeCalled()
    })

    it('should work with onExecute callback', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const throttledFn = liteThrottle(mockFn, {
        wait: 100,
        onExecute,
      })

      throttledFn('test')
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['test'], expect.any(Object))

      throttledFn('second')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('second')
      expect(onExecute).toHaveBeenCalledTimes(2)
    })
  })
})
