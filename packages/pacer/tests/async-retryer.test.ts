import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncRetryer, asyncRetry } from '../src/async-retryer'

describe('AsyncRetryer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('Constructor and Defaults', () => {
    it('should create with default options', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn)

      expect(retryer.options.backoff).toBe('exponential')
      expect(retryer.options.baseWait).toBe(1000)
      expect(retryer.options.enabled).toBe(true)
      expect(retryer.options.maxAttempts).toBe(3)
      expect(retryer.options.maxExecutionTime).toBe(Infinity)
      expect(retryer.options.maxTotalExecutionTime).toBe(Infinity)
      expect(retryer.options.throwOnError).toBe('last')
    })

    it('should merge custom options with defaults', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 5,
        backoff: 'linear',
        baseWait: 500,
      })

      expect(retryer.options.maxAttempts).toBe(5)
      expect(retryer.options.backoff).toBe('linear')
      expect(retryer.options.baseWait).toBe(500)
      expect(retryer.options.enabled).toBe(true) // Still default
    })

    it('should initialize with default state', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn)

      expect(retryer.store.state).toEqual({
        currentAttempt: 0,
        executionCount: 0,
        isExecuting: false,
        lastError: undefined,
        lastExecutionTime: 0,
        lastResult: undefined,
        status: 'idle',
        totalExecutionTime: 0,
      })
    })

    it('should merge initial state', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        initialState: { executionCount: 5 },
      })

      expect(retryer.store.state.executionCount).toBe(5)
      expect(retryer.store.state.currentAttempt).toBe(0) // Other defaults preserved
    })
  })

  describe('Successful Execution', () => {
    it('should execute function successfully on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn)

      const result = await retryer.execute('arg1', 'arg2')

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
      expect(retryer.store.state.executionCount).toBe(1)
      expect(retryer.store.state.lastResult).toBe('success')
      expect(retryer.store.state.status).toBe('idle')
      expect(retryer.store.state.currentAttempt).toBe(0)
    })

    it('should call onSuccess callback', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const onSuccess = vi.fn()
      const retryer = new AsyncRetryer(mockFn, { onSuccess })

      await retryer.execute('arg1')

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith('success', ['arg1'], retryer)
    })

    it('should update execution time and timestamp', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        vi.advanceTimersByTime(100)
        return 'success'
      })
      const retryer = new AsyncRetryer(mockFn)

      const beforeTime = Date.now()
      await retryer.execute()
      const afterTime = Date.now()

      expect(retryer.store.state.totalExecutionTime).toBeGreaterThan(0)
      expect(retryer.store.state.lastExecutionTime).toBeGreaterThanOrEqual(
        beforeTime,
      )
      expect(retryer.store.state.lastExecutionTime).toBeLessThanOrEqual(
        afterTime,
      )
    })
  })

  describe('Retry Logic', () => {
    it('should retry on failure and succeed on second attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        baseWait: 100,
        throwOnError: 'last',
      })

      const executePromise = retryer.execute('arg1')

      // Let the retry timer run
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)

      const result = await executePromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(retryer.store.state.executionCount).toBe(1)
      expect(retryer.store.state.lastResult).toBe('success')
      expect(retryer.store.state.status).toBe('idle')
    })

    it('should call onRetry callback for each retry', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      const onRetry = vi.fn()
      const retryer = new AsyncRetryer(mockFn, { onRetry, baseWait: 100 })

      const executePromise = retryer.execute()

      // Let first retry happen
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)

      // Let second retry happen
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(200) // Exponential backoff: 100 * 2^1

      await executePromise

      expect(onRetry).toHaveBeenCalledTimes(2)
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error), retryer)
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error), retryer)
    })

    it('should fail after exhausting all retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 0, // No delay to avoid timer issues
        throwOnError: 'last',
      })

      await expect(retryer.execute()).rejects.toThrow('Persistent failure')

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(retryer.store.state.lastError?.message).toBe('Persistent failure')
      expect(retryer.store.state.status).toBe('idle')
    })
  })

  describe('Backoff Strategies', () => {
    it('should use exponential backoff by default', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 3,
        baseWait: 100,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // First retry: wait 100ms (100 * 2^0)
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)

      // Second retry: wait 200ms (100 * 2^1)
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(200)

      // Third attempt will not retry, just finish
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(retryer.store.state.currentAttempt).toBe(3)
    })

    it('should use linear backoff', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 3,
        baseWait: 100,
        backoff: 'linear',
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // First retry should wait 100ms (100 * 1)
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)

      // Second retry should wait 200ms (100 * 2)
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(200)

      await executePromise
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should use fixed backoff', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 3,
        baseWait: 150,
        backoff: 'fixed',
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // Both retries should wait 150ms
      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(150)

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(150)

      await executePromise
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error Handling', () => {
    it('should throw on last error by default', async () => {
      const error = new Error('Test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const retryer = new AsyncRetryer(mockFn, { maxAttempts: 1 })

      await expect(retryer.execute()).rejects.toThrow('Test error')
    })

    it('should not throw when throwOnError is false', async () => {
      const error = new Error('Test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 1,
        throwOnError: false,
      })

      const result = await retryer.execute()
      expect(result).toBeUndefined()
    })

    it('should throw after retries when throwOnError is true', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 3,
        baseWait: 0, // No delay to avoid timer issues
        throwOnError: true,
      })

      await expect(retryer.execute()).rejects.toThrow('Test error')

      expect(mockFn).toHaveBeenCalledTimes(3) // Should still retry but throw at end
    })

    it('should call onError for every error', async () => {
      const error = new Error('Test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        onError,
        throwOnError: false,
      })

      const executePromise = retryer.execute('arg1')

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)
      await executePromise

      expect(onError).toHaveBeenCalledTimes(1) // Only called once at the end after all retries fail
      expect(onError).toHaveBeenCalledWith(error, ['arg1'], retryer)
    })

    it('should call onLastError only for final error', async () => {
      const error = new Error('Test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onLastError = vi.fn()
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        onLastError,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)
      await executePromise

      expect(onLastError).toHaveBeenCalledTimes(1)
      expect(onLastError).toHaveBeenCalledWith(error, retryer)
    })
  })

  describe('State Management', () => {
    it('should track execution state correctly', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        vi.advanceTimersByTime(50)
        return 'success'
      })
      const retryer = new AsyncRetryer(mockFn)

      expect(retryer.store.state.status).toBe('idle')
      expect(retryer.store.state.isExecuting).toBe(false)

      const executePromise = retryer.execute()

      // Should be executing now
      expect(retryer.store.state.status).toBe('executing')
      expect(retryer.store.state.isExecuting).toBe(true)
      expect(retryer.store.state.currentAttempt).toBe(1)

      await executePromise

      expect(retryer.store.state.status).toBe('idle')
      expect(retryer.store.state.isExecuting).toBe(false)
      expect(retryer.store.state.currentAttempt).toBe(0)
    })

    it('should show retrying status during retries', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        baseWait: 100,
        throwOnError: false,
      })

      // Start execution but do not await yet
      const executePromise = retryer.execute()

      // After first rejection, status should be 'retrying'
      // Allow microtasks to schedule the retry wait without advancing timers
      await Promise.resolve()
      expect(retryer.store.state.status).toBe('retrying')

      // Fast-forward the retry wait time
      vi.advanceTimersByTime(100)
      await executePromise

      // After completion, status should be 'idle'
      expect(retryer.store.state.status).toBe('idle')
    })

    it('should show disabled status when not enabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, { enabled: false })

      expect(retryer.store.state.status).toBe('disabled')

      const result = await retryer.execute()
      expect(result).toBeUndefined()
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('Callbacks', () => {
    it('should call onSettled after every execution attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success')
      const onSettled = vi.fn()
      const retryer = new AsyncRetryer(mockFn, { onSettled, baseWait: 100 })

      const executePromise = retryer.execute('arg1')

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)
      await executePromise

      // Called after each attempt (failed + successful)
      expect(onSettled).toHaveBeenCalledTimes(2)
      expect(onSettled).toHaveBeenCalledWith(['arg1'], retryer)
    })
  })

  describe('Dynamic Options', () => {
    it('should support function-based maxAttempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const maxAttemptsFn = vi.fn().mockReturnValue(2)
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: maxAttemptsFn,
        baseWait: 100,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100)
      await executePromise

      expect(maxAttemptsFn).toHaveBeenCalledWith(retryer)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should support function-based baseWait', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const baseWaitFn = vi.fn().mockReturnValue(200)
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: baseWaitFn,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(200) // Should use function return value
      await executePromise

      expect(baseWaitFn).toHaveBeenCalledWith(retryer)
    })

    it('should support function-based enabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const enabledFn = vi.fn().mockReturnValue(false)
      const retryer = new AsyncRetryer(mockFn, { enabled: enabledFn })

      const result = await retryer.execute()

      expect(enabledFn).toHaveBeenCalledWith(retryer)
      expect(result).toBeUndefined()
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('Cancellation', () => {
    it('should allow new executions after cancel and resolve undefined without error', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const onError = vi.fn()
      const retryer = new AsyncRetryer(mockFn, { onError, throwOnError: false })

      // Start and immediately cancel
      const executePromise1 = retryer.execute()
      retryer.abort()

      const result1 = await executePromise1
      expect(result1).toBeUndefined()
      expect(onError).not.toHaveBeenCalled()

      // Should be able to execute again after cancel
      const result2 = await retryer.execute()

      expect(result2).toBe('success')
      expect(retryer.store.state.isExecuting).toBe(false)
    })

    it('should cancel retry delays without error', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const onError = vi.fn()
      const retryer = new AsyncRetryer(mockFn, {
        baseWait: 1000,
        throwOnError: false,
        onError,
      })

      const executePromise = retryer.execute()

      // Wait for first attempt to fail and retry wait to be scheduled
      await Promise.resolve()

      // Cancel during retry delay
      retryer.abort()

      const result = await executePromise
      expect(result).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1) // Only first attempt
      expect(onError).toHaveBeenCalledTimes(1) // only final onError after loop completion before cancel
    })
  })

  describe('Reset', () => {
    it('should reset to initial state', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn)

      await retryer.execute()
      expect(retryer.store.state.executionCount).toBe(1)
      expect(retryer.store.state.lastResult).toBe('success')

      retryer.reset()

      expect(retryer.store.state).toEqual({
        currentAttempt: 0,
        executionCount: 0,
        isExecuting: false,
        lastError: undefined,
        lastExecutionTime: 0,
        lastResult: undefined,
        status: 'idle',
        totalExecutionTime: 0,
      })
    })

    it('should cancel ongoing execution when resetting', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        baseWait: 1000,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // Wait for first attempt to fail and retry wait to be scheduled
      await Promise.resolve()

      retryer.reset()

      const result = await executePromise
      expect(result).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1) // Only first attempt before reset
    })
  })

  describe('setOptions', () => {
    it('should update options', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, { maxAttempts: 3 })

      expect(retryer.options.maxAttempts).toBe(3)

      retryer.setOptions({ maxAttempts: 5, backoff: 'linear' })

      expect(retryer.options.maxAttempts).toBe(5)
      expect(retryer.options.backoff).toBe('linear')
      expect(retryer.options.baseWait).toBe(1000) // Unchanged
    })
  })

  describe('Timeout Controls', () => {
    it('should have timeout options in default options', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn)

      expect(retryer.options.maxExecutionTime).toBe(Infinity)
      expect(retryer.options.maxTotalExecutionTime).toBe(Infinity)
    })

    it('should accept custom timeout options', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        maxExecutionTime: 5000,
        maxTotalExecutionTime: 10000,
      })

      expect(retryer.options.maxExecutionTime).toBe(5000)
      expect(retryer.options.maxTotalExecutionTime).toBe(10000)
    })

    it('should not timeout when execution completes quickly', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        maxExecutionTime: 1000,
        maxTotalExecutionTime: 2000,
      })

      const result = await retryer.execute()

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should clean up timeouts when execution succeeds', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        maxExecutionTime: 1000,
        maxTotalExecutionTime: 2000,
      })

      const result = await retryer.execute()

      expect(result).toBe('success')
      // Advance time to ensure no timeout fires
      vi.advanceTimersByTime(5000)
      expect(retryer.store.state.status).toBe('idle')
    })
  })

  describe('Jitter', () => {
    it('should apply jitter to retry delays', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 1000,
        jitter: 0.1, // 10% jitter
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // First retry should have jitter applied
      await vi.runOnlyPendingTimersAsync()

      // The exact time will vary due to jitter, but should be within range
      // Base wait is 1000ms, jitter is 10%, so range is 900-1100ms
      // We'll advance by a bit more than the base to ensure it triggers
      vi.advanceTimersByTime(1100)

      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle jitter when crypto is not available', async () => {
      // Mock crypto to be undefined by temporarily replacing it
      const originalCrypto = globalThis.crypto
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        jitter: 0.1,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100) // Should use base wait without jitter
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)

      // Restore crypto
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      })
    })

    it('should not apply jitter when jitter is 0', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        jitter: 0,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100) // Exact base wait time
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Initial State', () => {
    it('should merge all initial state properties', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        initialState: {
          executionCount: 5,
          lastResult: 'previous result',
          lastError: new Error('Previous error'),
          totalExecutionTime: 1000,
        },
      })

      expect(retryer.store.state.executionCount).toBe(5)
      expect(retryer.store.state.lastResult).toBe('previous result')
      expect(retryer.store.state.lastError?.message).toBe('Previous error')
      expect(retryer.store.state.totalExecutionTime).toBe(1000)
      expect(retryer.store.state.currentAttempt).toBe(0) // Default preserved
      expect(retryer.store.state.isExecuting).toBe(false) // Default preserved
    })

    it('should update status based on initial state', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        initialState: {
          isExecuting: true,
          currentAttempt: 2,
        },
      })

      expect(retryer.store.state.status).toBe('retrying')
    })

    it('should show disabled status when enabled is false in initial state', () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const retryer = new AsyncRetryer(mockFn, {
        enabled: false,
        initialState: {
          isExecuting: true,
        },
      })

      expect(retryer.store.state.status).toBe('disabled')
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle function that throws non-Error objects', async () => {
      const mockFn = vi.fn().mockRejectedValue('String error')
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 1,
        throwOnError: false,
      })

      const result = await retryer.execute()

      expect(result).toBeUndefined()
      expect(retryer.store.state.lastError?.message).toBe('String error')
    })

    it('should handle function that throws null', async () => {
      const mockFn = vi.fn().mockRejectedValue(null)
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 1,
        throwOnError: false,
      })

      const result = await retryer.execute()

      expect(result).toBeUndefined()
      expect(retryer.store.state.lastError?.message).toBe('null')
    })

    it('should handle function that throws undefined', async () => {
      const mockFn = vi.fn().mockRejectedValue(undefined)
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 1,
        throwOnError: false,
      })

      const result = await retryer.execute()

      expect(result).toBeUndefined()
      expect(retryer.store.state.lastError?.message).toBe('undefined')
    })

    it('should handle very large jitter values', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        jitter: 1.5, // 150% jitter
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(250) // Should be enough for max jitter
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle negative jitter values', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 100,
        jitter: -0.5, // Negative jitter
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      await vi.runOnlyPendingTimersAsync()
      vi.advanceTimersByTime(100) // Should use base wait
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle zero maxAttempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 0,
        throwOnError: false,
      })

      const result = await retryer.execute()

      expect(result).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(0)
    })

    it('should handle zero baseWait', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
      const retryer = new AsyncRetryer(mockFn, {
        maxAttempts: 2,
        baseWait: 0,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // No delay between retries
      await vi.runOnlyPendingTimersAsync()
      await executePromise

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle cancellation during execution', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        vi.advanceTimersByTime(2000)
        return 'success'
      })
      const retryer = new AsyncRetryer(mockFn, {
        maxExecutionTime: 1000,
        throwOnError: false,
      })

      const executePromise = retryer.execute()

      // Cancel before timeout
      vi.advanceTimersByTime(500)
      retryer.abort()

      const result = await executePromise

      expect(result).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('asyncRetry utility function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should create a retry-enabled function', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')
    const retryFn = asyncRetry(mockFn, { maxAttempts: 2 })

    const result = await retryFn('arg1', 'arg2')

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should retry on failure', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failure'))
      .mockResolvedValue('success')
    const retryFn = asyncRetry(mockFn, { baseWait: 100, throwOnError: 'last' })

    const executePromise = retryFn()

    await vi.runOnlyPendingTimersAsync()
    vi.advanceTimersByTime(100)
    const result = await executePromise

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should use default options', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Failure'))
    const retryFn = asyncRetry(mockFn, { throwOnError: false })

    const executePromise = retryFn()

    // Should retry 3 times by default
    vi.advanceTimersByTime(1000) // First retry: 1000ms
    await vi.runOnlyPendingTimersAsync()
    vi.advanceTimersByTime(2000) // Second retry: 2000ms
    await vi.runOnlyPendingTimersAsync()

    const result = await executePromise
    expect(result).toBeUndefined()
    expect(mockFn).toHaveBeenCalledTimes(3) // Default maxAttempts
  })

  it('should support timeout options', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')
    const retryFn = asyncRetry(mockFn, {
      maxExecutionTime: 1000,
      maxTotalExecutionTime: 2000,
    })

    const result = await retryFn()

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
