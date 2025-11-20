import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiteDebouncer, liteDebounce } from '../src/lite-debouncer'

describe('LiteDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Debouncing', () => {
    it('should not execute the function before the specified wait', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()
    })

    it('should execute the function after the specified wait', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should debounce multiple calls', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute()
      debouncer.maybeExecute()
      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should pass arguments to the debounced function', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test', 123)
      vi.advanceTimersByTime(1000)

      expect(mockFn).toBeCalledWith('test', 123)
    })

    it('should use latest arguments from multiple calls', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('first')
      debouncer.maybeExecute('second')
      debouncer.maybeExecute('third')

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledWith('third')
    })
  })

  describe('Execution Edge Cases', () => {
    it('should execute immediately with leading option', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
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
      const debouncer = new LiteDebouncer(mockFn, {
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
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      debouncer.maybeExecute('test1')
      debouncer.maybeExecute('test2')
      expect(mockFn).toBeCalledTimes(1) // Leading call
      expect(mockFn).toBeCalledWith('test1')

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(2) // Trailing call
      expect(mockFn).toHaveBeenLastCalledWith('test2')
    })

    it('should default to trailing-only execution', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test1')
      debouncer.maybeExecute('test2')
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test2')
    })

    it('should handle case where both leading and trailing are false', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
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
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute()
      debouncer.cancel()

      vi.advanceTimersByTime(1000)
      expect(mockFn).not.toBeCalled()
    })

    it('should properly handle canLeadingExecute flag after cancellation', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
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
      const debouncer = new LiteDebouncer(mockFn, {
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
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      expect(mockFn).not.toBeCalled()

      debouncer.flush()
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test')
    })

    it('should clear pending timeout when flushing', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      debouncer.flush()

      // Advance time to ensure timeout would have fired
      vi.advanceTimersByTime(1000)

      expect(mockFn).toBeCalledTimes(1)
    })

    it('should do nothing when no pending execution', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.flush()
      expect(mockFn).not.toBeCalled()
    })

    it('should work with leading and trailing execution', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
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

    it('should flush pending execution even with trailing: false', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)

      debouncer.maybeExecute('second')
      debouncer.flush()

      // Since we have lastArgs, flush will execute even with trailing: false
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })
  })

  describe('Callbacks', () => {
    it('should call onExecute after leading execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        leading: true,
        onExecute,
      })

      debouncer.maybeExecute('test')

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledWith(['test'], debouncer)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute after trailing execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        trailing: true,
        onExecute,
      })

      debouncer.maybeExecute('test')
      expect(onExecute).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledWith(['test'], debouncer)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute with latest args after trailing execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        trailing: true,
        onExecute,
      })

      debouncer.maybeExecute('first')
      debouncer.maybeExecute('second')

      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledWith(['second'], debouncer)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onExecute after flush', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        onExecute,
      })

      debouncer.maybeExecute('test')
      debouncer.flush()

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledWith(['test'], debouncer)
    })

    it('should not call onExecute when cancelled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        onExecute,
      })

      debouncer.maybeExecute('test')
      debouncer.cancel()

      vi.advanceTimersByTime(100)

      expect(mockFn).not.toHaveBeenCalled()
      expect(onExecute).not.toHaveBeenCalled()
    })

    it('should work with both leading and trailing enabled', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: 100,
        leading: true,
        trailing: true,
        onExecute,
      })

      debouncer.maybeExecute('first')
      expect(onExecute).toHaveBeenCalledWith(['first'], debouncer)

      debouncer.maybeExecute('second')
      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledWith(['second'], debouncer)
      expect(onExecute).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle wait time of 0', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 0 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle negative wait time', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: -1000 })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle very large wait times', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, {
        wait: Number.MAX_SAFE_INTEGER,
      })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(Number.MAX_SAFE_INTEGER)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle NaN wait time', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: NaN })

      debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(0)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle undefined/null arguments', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute(undefined, null)
      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledWith(undefined, null)
    })

    it('should prevent memory leaks by clearing timeouts', () => {
      const mockFn = vi.fn()
      const debouncer = new LiteDebouncer(mockFn, { wait: 1000 })

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
  })
})

describe('liteDebounce helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a debounced function with default options', () => {
      const mockFn = vi.fn()
      const debouncedFn = liteDebounce(mockFn, { wait: 1000 })

      debouncedFn('test')
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('test')
    })

    it('should pass arguments correctly', () => {
      const mockFn = vi.fn()
      const debouncedFn = liteDebounce(mockFn, { wait: 1000 })

      debouncedFn(42, 'test', { foo: 'bar' })
      vi.advanceTimersByTime(1000)

      expect(mockFn).toBeCalledWith(42, 'test', { foo: 'bar' })
    })
  })

  describe('Execution Options', () => {
    it('should respect leading option', () => {
      const mockFn = vi.fn()
      const debouncedFn = liteDebounce(mockFn, {
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
      const debouncedFn = liteDebounce(mockFn, { wait: 1000 })

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
      const debouncedFn = liteDebounce(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
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

    it('should work with onExecute callback', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const debouncedFn = liteDebounce(mockFn, {
        wait: 100,
        onExecute,
      })

      debouncedFn('test')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['test'], expect.any(Object))
    })
  })
})
