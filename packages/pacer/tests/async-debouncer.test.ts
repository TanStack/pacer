import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncDebouncer } from '../src/async-debouncer'

describe('AsyncDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Async Debouncing', () => {
    it('should not execute the async function before the specified wait', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(999)
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1)
      await promise
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should execute the async function after the specified wait', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      const result = await promise
      expect(mockFn).toBeCalledTimes(1)
      expect(result).toBe('result')
    })

    it('should debounce multiple async calls', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Make multiple calls
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(500)
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(500)
      const promise3 = debouncer.maybeExecute()

      // Function should not be called yet
      expect(mockFn).not.toBeCalled()

      // Wait for the full delay
      vi.advanceTimersByTime(1000)
      await Promise.any([promise1, promise2, promise3])

      // Should only execute once
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should pass arguments to the debounced async function', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute('arg1', 42, { foo: 'bar' })
      vi.advanceTimersByTime(1000)
      await promise

      expect(mockFn).toBeCalledWith('arg1', 42, { foo: 'bar' })
    })

    it('should return a promise that resolves with the function result', async () => {
      const mockFn = vi.fn().mockResolvedValue('test result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute()
      expect(promise).toBeInstanceOf(Promise)

      vi.advanceTimersByTime(1000)
      const result = await promise
      expect(result).toBe('test result')
    })
  })

  describe('Async Execution Edge Cases', () => {
    it('should execute immediately with leading option', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      const promise = debouncer.maybeExecute()
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith()

      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).toBeCalledTimes(1) // Should not execute again
    })

    it('should respect leading edge timing', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      // First call - executes immediately
      const promise1 = debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Call again before wait expires - should not execute
      vi.advanceTimersByTime(500)
      const promise2 = debouncer.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(1)

      // Advance to end of second call's wait period - should not execute
      vi.advanceTimersByTime(1000)
      await Promise.all([promise1, promise2])
      expect(mockFn).toBeCalledTimes(1)

      // Now that the full wait has passed since last call, this should execute
      const promise3 = debouncer.maybeExecute('third')
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('third')
      await promise3
    })

    it('should support both leading and trailing execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      // First call - executes immediately (leading)
      const promise1 = debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Second call - should not execute immediately
      const promise2 = debouncer.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(1)

      // After wait, should execute again (trailing)
      vi.advanceTimersByTime(1000)
      await Promise.all([promise1, promise2])
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })

    it('should default to trailing-only execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First call - should not execute immediately
      const promise1 = debouncer.maybeExecute('first')
      expect(mockFn).not.toBeCalled()

      // Second call - should not execute immediately
      const promise2 = debouncer.maybeExecute('second')
      expect(mockFn).not.toBeCalled()

      // After wait, should execute once with last arguments
      vi.advanceTimersByTime(1000)
      await Promise.any([promise1, promise2])
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('second')
    })

    it('should handle case where both leading and trailing are false', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: false,
        trailing: false,
      })

      // First call - should not execute
      debouncer.maybeExecute('test')
      expect(mockFn).not.toBeCalled()

      // Second call - should cancel first promise and not execute
      const promise2 = debouncer.maybeExecute('test2')
      expect(mockFn).not.toBeCalled()

      // Advance time and wait for the last promise
      vi.advanceTimersByTime(1000)
      await promise2

      // Verify no executions occurred
      expect(mockFn).not.toBeCalled()
    })

    it('should handle rapid calls with leading edge execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        trailing: false,
      })

      // Make rapid calls
      debouncer.maybeExecute('first')
      debouncer.maybeExecute('second')
      debouncer.maybeExecute('third')
      const promise4 = debouncer.maybeExecute('fourth')

      // Only first call should execute immediately
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Wait for timeout and last promise
      vi.advanceTimersByTime(1000)
      await promise4

      // Next call should execute immediately
      const promise5 = debouncer.maybeExecute('fifth')
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('fifth')
      await promise5
    })
  })

  describe('Promise Handling', () => {
    it('should properly handle promise resolution', async () => {
      const mockFn = vi.fn().mockResolvedValue('resolved value')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      const result = await promise

      expect(result).toBe('resolved value')
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle promise errors without rejecting', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)

      // The promise should resolve with undefined, not reject
      const result = await promise
      expect(result).toBeUndefined()
      expect(onError).toBeCalledWith(error, debouncer)
    })

    it('should maintain execution order of promises', async () => {
      const results: Array<string> = []
      const mockFn = vi.fn().mockImplementation((value: string) => {
        results.push(value)
        return value
      })
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Make multiple calls
      debouncer.maybeExecute('first')
      vi.advanceTimersByTime(500)
      debouncer.maybeExecute('second')
      vi.advanceTimersByTime(500)
      const promise3 = debouncer.maybeExecute('third')

      // Wait for the last promise
      vi.advanceTimersByTime(1000)
      await promise3

      // Should only execute once with the last value
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('third')
      expect(results).toEqual(['third'])
    })

    it('should handle multiple promise resolutions', async () => {
      const mockFn = vi.fn().mockImplementation((value: string) => {
        return value
      })
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Start first execution
      const promise1 = debouncer.maybeExecute('first')
      vi.advanceTimersByTime(1000)
      await promise1
      expect(mockFn).toHaveBeenCalledWith('first')

      // Start second execution after first completes
      const promise2 = debouncer.maybeExecute('second')
      vi.advanceTimersByTime(1000)
      await promise2
      expect(mockFn).toHaveBeenCalledWith('second')

      // Start third execution after second completes
      const promise3 = debouncer.maybeExecute('third')
      vi.advanceTimersByTime(1000)
      await promise3
      expect(mockFn).toHaveBeenCalledWith('third')

      expect(mockFn).toBeCalledTimes(3)
    })

    it('should handle promise cancellation', () => {
      const mockFn = vi.fn().mockImplementation(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return value
      })
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      debouncer.maybeExecute('test')
      debouncer.cancel()
      vi.advanceTimersByTime(1100)
      expect(mockFn).toBeCalledTimes(0)
    })
  })

  describe('Error Handling', () => {
    it('should call onError when the async function throws', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const onSettled = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
        onSettled,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(onError).toBeCalledWith(error, debouncer)
      expect(onSettled).toBeCalledWith(debouncer)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)
    })

    it('should not break debouncing chain on error', async () => {
      const error = new Error('test error')
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success')
      const onError = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
      })

      // First call - should error
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(onError).toBeCalledWith(error, debouncer)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)

      // Second call - should succeed
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      const result = await promise2
      expect(result).toBe('success')
      expect(mockFn).toBeCalledTimes(2)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(2)
      expect(debouncer.getSuccessCount()).toBe(1)
    })

    it('should handle multiple errors in sequence', async () => {
      const error1 = new Error('error 1')
      const error2 = new Error('error 2')
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
      const onError = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
      })

      // First call - should error
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(onError).toHaveBeenNthCalledWith(1, error1, debouncer)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)

      // Second call - should error again
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise2
      expect(onError).toHaveBeenNthCalledWith(2, error2, debouncer)
      expect(debouncer.getErrorCount()).toBe(2)
      expect(debouncer.getSettleCount()).toBe(2)
      expect(debouncer.getSuccessCount()).toBe(0)
    })

    it('should handle errors during leading execution', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const onSettled = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        onError,
        onSettled,
      })

      const promise = debouncer.maybeExecute()
      await vi.advanceTimersByTimeAsync(1000)
      await promise
      expect(onError).toBeCalledWith(error, debouncer)
      expect(onSettled).toBeCalledWith(debouncer)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)
    })

    it('should handle errors during trailing execution', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const onSettled = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        trailing: true,
        onError,
        onSettled,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise
      expect(onError).toBeCalledWith(error, debouncer)
      expect(onSettled).toBeCalledWith(debouncer)
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)
    })

    it('should maintain state after error', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
      })

      // First call - should error
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1

      // Verify state is maintained
      expect(debouncer.getErrorCount()).toBe(1)
      expect(debouncer.getSettleCount()).toBe(1)
      expect(debouncer.getSuccessCount()).toBe(0)
      expect(debouncer.getIsPending()).toBe(false)
    })
  })

  describe('Callback Execution', () => {
    it('should call onSuccess after successful execution')
    it('should call onSettled after execution completes')
    it('should call onError when execution fails')
    it('should maintain correct callback order')
    it('should handle callback errors gracefully')
  })

  describe('Execution Control', () => {
    it('should cancel pending execution')
    it('should properly handle canLeadingExecute flag after cancellation')
    it('should abort in-progress execution when cancelled')
    it('should handle rapid calls with cancellation')
    it('should handle cancellation during leading execution')
    it('should handle cancellation during trailing execution')
  })

  describe('Result Management', () => {
    it('should track last result')
    it('should return last result when execution is pending')
    it('should clear last result on cancellation')
    it('should maintain last result across multiple executions')
    it('should handle undefined/null results')
  })

  describe('Enabled/Disabled State', () => {
    it('should not execute when enabled is false')
    it('should not execute leading edge when disabled')
    it('should default to enabled')
    it('should allow enabling/disabling after construction')
    it('should allow disabling mid-wait')
  })

  describe('Options Management', () => {
    it('should allow updating multiple options at once')
    it('should handle option changes during execution')
    it('should maintain state across option changes')
  })

  describe('State Tracking', () => {
    it('should track execution count')
    it('should track execution count with leading and trailing')
    it('should not increment count when execution is cancelled')
    it('should track pending state correctly')
    it('should track execution state correctly')
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle wait time of 0')
    it('should handle negative wait time by using 0')
    it('should handle very large wait times')
    it('should handle NaN wait time by using 0')
    it('should handle undefined/null arguments')
    it('should prevent memory leaks by clearing timeouts')
    it('should handle rapid option changes')
    it('should handle rapid enable/disable cycles')
  })
})

describe('asyncDebounce helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a debounced async function with default options')
    it('should pass arguments correctly')
    it('should return a promise')
  })

  describe('Execution Options', () => {
    it('should respect leading option')
    it('should handle multiple calls with trailing edge')
    it('should support both leading and trailing execution')
  })
})
