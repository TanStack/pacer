import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncDebouncer, asyncDebounce } from '../src/async-debouncer'

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
    it('should call onSuccess after successful execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const onSuccess = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSuccess,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(onSuccess).toBeCalledTimes(1)
      expect(onSuccess).toBeCalledWith('success', debouncer)
    })

    it('should call onSettled after execution completes', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onSettled = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSettled,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(onSettled).toBeCalledTimes(1)
      expect(onSettled).toBeCalledWith(debouncer)
    })

    it('should call onError when execution fails', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(onError).toBeCalledTimes(1)
      expect(onError).toBeCalledWith(error, debouncer)
    })

    it('should maintain correct callback order', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const callOrder: Array<string> = []
      const onSuccess = vi
        .fn()
        .mockImplementation(() => callOrder.push('success'))
      const onSettled = vi
        .fn()
        .mockImplementation(() => callOrder.push('settled'))
      const onError = vi.fn().mockImplementation(() => callOrder.push('error'))

      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSuccess,
        onSettled,
        onError,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(callOrder).toEqual(['success', 'settled'])
    })

    it('should handle callback errors gracefully', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const callbackError = new Error('callback error')
      const onSuccess = vi.fn().mockImplementation(() => {
        throw callbackError
      })
      const onSettled = vi.fn()
      const onError = vi.fn()

      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSuccess,
        onSettled,
        onError,
      })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      // onSuccess throws, which triggers onError, and onSettled is always called
      expect(onSuccess).toBeCalledTimes(1)
      expect(onError).toBeCalledTimes(1)
      expect(onError).toBeCalledWith(callbackError, debouncer)
      expect(onSettled).toBeCalledTimes(1)
      expect(onSettled).toBeCalledWith(debouncer)
    })
  })

  describe('Execution Control', () => {
    it('should cancel pending execution', () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Start execution
      debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(true)

      // Cancel before wait period ends
      debouncer.cancel()
      expect(debouncer.getIsPending()).toBe(false)

      // Advance time and verify no execution
      vi.advanceTimersByTime(1000)
      expect(mockFn).not.toBeCalled()
    })

    it('should properly handle canLeadingExecute flag after cancellation', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
      })

      // First call - should execute immediately
      const promise1 = debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Cancel and verify canLeadingExecute is reset
      debouncer.cancel()
      expect(debouncer.getIsPending()).toBe(false)

      // Next call should execute immediately again
      const promise2 = debouncer.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toBeCalledWith('second')

      await Promise.all([promise1, promise2])
    })

    it('should handle cancellation during leading execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
      })

      // First call - executes immediately
      const promise1 = debouncer.maybeExecute('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Cancel during leading execution
      debouncer.cancel()
      expect(debouncer.getIsPending()).toBe(false)

      // Next call should execute immediately again
      const promise2 = debouncer.maybeExecute('second')
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toBeCalledWith('second')

      await Promise.all([promise1, promise2])
    })
  })

  describe('Result Management', () => {
    it('should track last result', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      const promise = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise

      expect(debouncer.getLastResult()).toBe('result')
    })

    it('should return last result when execution is pending', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('result')

      // Second execution - should still return last result while pending
      const promise2 = debouncer.maybeExecute()
      expect(debouncer.getLastResult()).toBe('result')
      vi.advanceTimersByTime(1000)
      await promise2
    })

    it('should clear last result on cancellation', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('result')

      // Second execution with cancellation
      debouncer.maybeExecute()
      debouncer.cancel()
      expect(debouncer.getLastResult()).toBe('result') // Should still have last result

      // Third execution
      const promise3 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise3
      expect(debouncer.getLastResult()).toBe('result')
    })

    it('should maintain last result across multiple executions', async () => {
      const mockFn = vi
        .fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second')
        .mockResolvedValueOnce('third')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('first')

      // Second execution
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise2
      expect(debouncer.getLastResult()).toBe('second')

      // Third execution
      const promise3 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise3
      expect(debouncer.getLastResult()).toBe('third')
    })

    it('should handle undefined/null results', async () => {
      const mockFn = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(null)
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Test undefined result
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBeUndefined()

      // Test null result
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise2
      expect(debouncer.getLastResult()).toBeNull()
    })

    it('should maintain last result after error', async () => {
      const mockFn = vi
        .fn()
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('test error'))
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution - success
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('success')

      // Second execution - error
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise2
      expect(debouncer.getLastResult()).toBe('success') // Should maintain last successful result
    })
  })

  describe('Enabled/Disabled State', () => {
    it('should not execute when enabled is false', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        enabled: false,
      })

      // Try to execute while disabled
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(false)
      expect(debouncer.getIsExecuting()).toBe(false)

      // Advance time and verify no execution
      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).not.toBeCalled()
    })

    it('should not execute leading edge when disabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        leading: true,
        enabled: false,
      })

      // Try to execute while disabled
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(false)
      expect(debouncer.getIsExecuting()).toBe(false)

      // Advance time and verify no execution
      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).not.toBeCalled()
    })

    it('should default to enabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Should execute by default
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(true)

      // Advance time and verify execution
      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should allow disabling mid-wait', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Start execution
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(true)

      // Disable during wait
      debouncer.setOptions({ enabled: false })
      expect(debouncer.getIsPending()).toBe(false)

      // Advance time and verify no execution
      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).not.toBeCalled()
    })

    it('should handle rapid enable/disable cycles', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Enable/disable rapidly
      debouncer.setOptions({ enabled: true })
      debouncer.maybeExecute()
      debouncer.setOptions({ enabled: false })
      debouncer.setOptions({ enabled: true })
      debouncer.maybeExecute()
      debouncer.setOptions({ enabled: false })
      debouncer.setOptions({ enabled: true })
      const promise = debouncer.maybeExecute()

      // Should only have one pending execution
      expect(debouncer.getIsPending()).toBe(true)

      // Advance time and verify single execution
      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should maintain state when disabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('result')

      // Disable and verify state is maintained
      debouncer.setOptions({ enabled: false })
      expect(debouncer.getLastResult()).toBe('result')
      expect(debouncer.getIsPending()).toBe(false)
      expect(debouncer.getIsExecuting()).toBe(false)

      // Re-enable and verify state is still maintained
      debouncer.setOptions({ enabled: true })
      expect(debouncer.getLastResult()).toBe('result')
    })
  })

  describe('Options Management', () => {
    it('should allow updating multiple options at once', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // Update multiple options
      debouncer.setOptions({
        wait: 500,
        leading: true,
        trailing: false,
        onSuccess: vi.fn(),
        onError: vi.fn(),
        onSettled: vi.fn(),
      })

      // Verify new options are applied
      const promise = debouncer.maybeExecute()
      expect(mockFn).toBeCalledTimes(1) // Leading execution
      expect(mockFn).toBeCalledWith()

      // Advance time and verify no trailing execution
      vi.advanceTimersByTime(500)
      await promise
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle option changes during execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onSuccess = vi.fn()
      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSuccess: vi.fn(),
      })

      // Start execution
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(true)

      // Change options during wait
      debouncer.setOptions({ onSuccess })

      // Advance time and verify new callback is used
      vi.advanceTimersByTime(1000)
      await promise
      expect(onSuccess).toBeCalledTimes(1)
      expect(onSuccess).toBeCalledWith('result', debouncer)
    })

    it('should maintain state across option changes', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debouncer = new AsyncDebouncer(mockFn, { wait: 1000 })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(debouncer.getLastResult()).toBe('result')
      expect(debouncer.getSuccessCount()).toBe(1)

      // Change options
      debouncer.setOptions({ wait: 500, leading: true })

      // Verify state is maintained
      expect(debouncer.getLastResult()).toBe('result')
      expect(debouncer.getSuccessCount()).toBe(1)

      // Second execution with new options
      const promise2 = debouncer.maybeExecute()
      expect(mockFn).toBeCalledTimes(2) // Leading execution
      vi.advanceTimersByTime(500)
      await promise2
      expect(debouncer.getSuccessCount()).toBe(2)
    })

    it('should handle callback option changes', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onSuccess1 = vi.fn()
      const onSuccess2 = vi.fn()
      const onError1 = vi.fn()
      const onError2 = vi.fn()
      const onSettled1 = vi.fn()
      const onSettled2 = vi.fn()

      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onSuccess: onSuccess1,
        onError: onError1,
        onSettled: onSettled1,
      })

      // First execution
      const promise1 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise1
      expect(onSuccess1).toBeCalledTimes(1)
      expect(onSettled1).toBeCalledTimes(1)
      expect(onError1).not.toBeCalled()

      // Change callbacks
      debouncer.setOptions({
        onSuccess: onSuccess2,
        onError: onError2,
        onSettled: onSettled2,
      })

      // Second execution
      const promise2 = debouncer.maybeExecute()
      vi.advanceTimersByTime(1000)
      await promise2
      expect(onSuccess2).toBeCalledTimes(1)
      expect(onSettled2).toBeCalledTimes(1)
      expect(onError2).not.toBeCalled()
    })

    it('should handle option changes during error handling', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError1 = vi.fn()
      const onError2 = vi.fn()
      const onSettled1 = vi.fn()
      const onSettled2 = vi.fn()

      const debouncer = new AsyncDebouncer(mockFn, {
        wait: 1000,
        onError: onError1,
        onSettled: onSettled1,
      })

      // Start execution
      const promise = debouncer.maybeExecute()
      expect(debouncer.getIsPending()).toBe(true)

      // Change callbacks during wait
      debouncer.setOptions({
        onError: onError2,
        onSettled: onSettled2,
      })

      // Advance time and verify new callbacks are used
      vi.advanceTimersByTime(1000)
      await promise
      expect(onError2).toBeCalledTimes(1)
      expect(onError2).toBeCalledWith(error, debouncer)
      expect(onSettled2).toBeCalledTimes(1)
      expect(onSettled2).toBeCalledWith(debouncer)
      expect(onError1).not.toBeCalled()
      expect(onSettled1).not.toBeCalled()
    })
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
    it('should create a debounced async function with default options', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, { wait: 1000 })

      const promise = debounced()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      const result = await promise
      expect(mockFn).toBeCalledTimes(1)
      expect(result).toBe('result')
    })

    it('should pass arguments correctly', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, { wait: 1000 })

      const promise = debounced('arg1', 42, { foo: 'bar' })
      vi.advanceTimersByTime(1000)
      await promise

      expect(mockFn).toBeCalledWith('arg1', 42, { foo: 'bar' })
    })

    it('should return a promise', () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, { wait: 1000 })

      const promise = debounced()
      expect(promise).toBeInstanceOf(Promise)
    })
  })

  describe('Execution Options', () => {
    it('should respect leading option', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, { wait: 1000, leading: true })

      const promise = debounced()
      expect(mockFn).toBeCalledTimes(1)

      vi.advanceTimersByTime(1000)
      await promise
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should handle multiple calls with trailing edge', () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, { wait: 1000 })

      debounced()
      debounced()
      debounced()
      expect(mockFn).not.toBeCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toBeCalledTimes(1)
    })

    it('should support both leading and trailing execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const debounced = asyncDebounce(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      // First call - should execute immediately
      const promise1 = debounced('first')
      expect(mockFn).toBeCalledTimes(1)
      expect(mockFn).toBeCalledWith('first')

      // Second call - should queue for trailing
      const promise2 = debounced('second')
      expect(mockFn).toBeCalledTimes(1)

      vi.advanceTimersByTime(1000)
      await Promise.all([promise1, promise2])
      expect(mockFn).toBeCalledTimes(2)
      expect(mockFn).toBeCalledWith('second')
    })
  })
})
