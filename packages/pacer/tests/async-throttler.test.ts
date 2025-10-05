import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncThrottler } from '../src/async-throttler'

describe('AsyncThrottler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should execute immediately on first call', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    await throttler.maybeExecute()
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute more than once within the wait period', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call executes immediately
    const promise1 = throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
    await promise1

    // Make multiple calls within the wait period
    throttler.maybeExecute('second')
    throttler.maybeExecute('third')

    // Verify no additional executions occurred
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    // Advance time to just before wait period ends
    vi.advanceTimersByTime(99)
    await Promise.resolve()

    // Should still be at one execution
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should handle special timing cases with delayed calls', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // Initial call
    const promise1 = throttler.maybeExecute(1)
    throttler.maybeExecute(2)

    // First call should execute immediately
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith(1)
    await promise1

    // Small delay then another call
    vi.advanceTimersByTime(35)
    throttler.maybeExecute(3)

    // Another small delay and final call
    vi.advanceTimersByTime(35)
    const finalPromise = throttler.maybeExecute(4)

    // Advance to complete the throttle period
    vi.advanceTimersByTime(100)
    await finalPromise

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith(4)
  })

  it('should execute with latest args after wait period', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    await throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledWith('first')

    // These calls should be throttled
    const promise = throttler.maybeExecute('second')

    vi.advanceTimersByTime(100)
    await promise

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should track execution count correctly', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    await throttler.maybeExecute()
    expect(throttler.store.state.successCount).toBe(1)

    const promise = throttler.maybeExecute()
    expect(throttler.store.state.successCount).toBe(1)

    vi.advanceTimersByTime(100)
    await promise
    expect(throttler.store.state.successCount).toBe(2)
  })

  it('should handle errors with onError callback', async () => {
    const error = new Error('Test error')
    const mockFn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()
    const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

    await throttler.maybeExecute()
    expect(onError).toHaveBeenCalledWith(error, [], throttler)
  })

  it('should continue processing after function throws error if onError is provided', async () => {
    const onError = vi.fn()
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('First call error'))
      .mockResolvedValueOnce(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

    // First call throws
    await throttler.maybeExecute(1)
    expect(onError).toHaveBeenCalledWith(
      new Error('First call error'),
      [1],
      throttler,
    )
    // Second call should still execute after wait period
    const promise = throttler.maybeExecute(2)
    vi.advanceTimersByTime(100)
    await promise

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith(2)
  })

  it('should maintain proper timing between executions', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    await throttler.maybeExecute('a')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('a')

    // Should be throttled
    const promise = throttler.maybeExecute('b')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    await promise
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('b')

    // Should execute immediately after wait period
    vi.advanceTimersByTime(100)
    await throttler.maybeExecute('c')
    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(mockFn).toHaveBeenLastCalledWith('c')
  })

  it('should update nextExecutionTime after each execution', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    const now = Date.now()
    await throttler.maybeExecute()

    expect(throttler.store.state.nextExecutionTime).toBe(now + 100)

    vi.advanceTimersByTime(100)
    await throttler.maybeExecute()

    expect(throttler.store.state.nextExecutionTime).toBe(now + 200)
  })

  it('should maintain isPending state correctly when trailing is scheduled during long-running execution', async () => {
    let resolveExecution: ((value: string) => void) | undefined
    const mockFn = vi.fn().mockImplementation(() => {
      return new Promise<string>((resolve) => {
        resolveExecution = resolve
      })
    })
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // Start long-running leading execution
    const promise1 = throttler.maybeExecute('first')
    expect(throttler.store.state.isExecuting).toBe(true)
    expect(throttler.store.state.isPending).toBe(false)
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Call again during execution - the second call will wait for first to complete
    const promise2 = throttler.maybeExecute('second')

    // Advance timers to allow the waiting loop to progress
    await vi.advanceTimersByTimeAsync(100)

    // After waiting loop completes, second call should have returned with lastResult
    expect(throttler.store.state.isExecuting).toBe(true)
    expect(mockFn).toHaveBeenCalledTimes(1) // Still just the first call

    // Resolve the first execution
    resolveExecution!('result1')
    await promise1

    // After first execution completes, if there's a pending execution it should trigger
    expect(throttler.store.state.isExecuting).toBe(false)

    // Advance timers to trigger trailing execution if one was scheduled
    await vi.advanceTimersByTimeAsync(100)

    const result2 = await promise2
    expect(result2).toBe('result1') // Second call returns first result due to waiting loop
  })

  it('should cancel pending execution', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call executes immediately
    await throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    // Start a throttled call
    const promise = throttler.maybeExecute('second')
    // Cancel it immediately
    throttler.cancel()

    // Advance timers to allow any waiting loops to exit
    await vi.advanceTimersByTimeAsync(10)

    // Wait for the promise to settle
    await expect(promise).resolves.toBeUndefined()
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should allow new executions after cancel', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    await throttler.maybeExecute('first')
    const promise = throttler.maybeExecute('second')
    throttler.cancel()

    // Advance timers to allow any waiting loops to exit
    await vi.advanceTimersByTimeAsync(10)
    await promise

    await vi.advanceTimersByTimeAsync(100)
    await throttler.maybeExecute('third')

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
    expect(mockFn).toHaveBeenNthCalledWith(2, 'third')
  })

  it('should handle multiple cancel calls safely', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call should execute
    await throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    // Second call should be cancelled
    const promise = throttler.maybeExecute('second')
    throttler.cancel()

    // Advance timers to allow any waiting loops to exit
    await vi.advanceTimersByTimeAsync(10)
    await promise

    // Multiple cancels should not throw
    throttler.cancel()

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should cancel while waiting for executing function to complete', async () => {
    let resolveFirst: (value: unknown) => void
    const firstCall = new Promise((resolve) => {
      resolveFirst = resolve
    })

    const mockFn = vi.fn().mockImplementation(() => firstCall)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // Start first long-running call
    const promise1 = throttler.maybeExecute('first')
    const promise2 = throttler.maybeExecute('second')

    // Advance timers to allow waiting loop to start
    await vi.advanceTimersByTimeAsync(10)

    throttler.cancel()

    // Advance timers to allow cancel to take effect
    await vi.advanceTimersByTimeAsync(10)

    resolveFirst!({})
    await promise1
    await promise2

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should cancel pending calls when cancel is called', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call executes immediately
    const promise1 = throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
    await promise1

    // Second call is queued but then cancelled
    const promise2 = throttler.maybeExecute('second')
    throttler.cancel()
    await promise2

    // Third call is also queued and cancelled
    const promise3 = throttler.maybeExecute('third')
    throttler.cancel()
    await promise3

    // Only the first call should have executed
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  describe('Flush Method', () => {
    it('should execute pending function immediately', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, { wait: 1000 })

      // First call should execute immediately (leading execution)
      const promise1 = throttler.maybeExecute('first')
      await promise1 // Wait for the first execution to complete
      expect(mockFn).toHaveBeenCalledTimes(1)

      // Second call should be throttled and return a promise
      const promise2 = throttler.maybeExecute('second')
      expect(mockFn).toHaveBeenCalledTimes(1) // Still throttled

      const flushResult = await throttler.flush()
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
      expect(flushResult).toBe('result')

      const result2 = await promise2
      expect(result2).toBe('result')
    })

    it('should clear pending timeout when flushing', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, { wait: 1000 })

      await throttler.maybeExecute('first')
      const promise2 = throttler.maybeExecute('second')

      await throttler.flush()

      // Advance time to ensure timeout would have fired
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(mockFn).toHaveBeenCalledTimes(2)
      await promise2 // Make sure promise resolves
    })

    it('should return undefined when no pending execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, { wait: 1000 })

      const result = await throttler.flush()
      expect(mockFn).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should work with leading and trailing execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, {
        wait: 1000,
        leading: true,
        trailing: true,
      })

      const promise1 = throttler.maybeExecute('first')
      await promise1 // Wait for leading execution to complete
      expect(mockFn).toHaveBeenCalledTimes(1)

      const promise2 = throttler.maybeExecute('second')

      const flushResult = await throttler.flush()

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
      expect(flushResult).toBe('result')

      const result2 = await promise2
      expect(result2).toBe('result')
    })

    it('should work with trailing-only execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, {
        wait: 1000,
        leading: false,
        trailing: true,
      })

      const promise = throttler.maybeExecute('first')
      expect(mockFn).not.toHaveBeenCalled()

      const flushResult = await throttler.flush()
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')
      expect(flushResult).toBe('result')

      // The promise gets resolved by flush with the result
      const promiseResult = await promise
      expect(promiseResult).toBe('result')
    })

    it('should update state correctly after flush', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const throttler = new AsyncThrottler(mockFn, { wait: 1000 })

      await throttler.maybeExecute('first')
      const promise2 = throttler.maybeExecute('second')

      expect(throttler.store.state.isPending).toBe(true)
      expect(throttler.store.state.successCount).toBe(1) // From leading execution

      await throttler.flush()
      expect(throttler.store.state.isPending).toBe(false)
      expect(throttler.store.state.successCount).toBe(2)

      await promise2 // Make sure promise resolves
    })
  })

  describe('Comprehensive Error Handling', () => {
    describe('Basic Error Scenarios', () => {
      it('should track error count correctly', async () => {
        const error = new Error('test error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        await throttler.maybeExecute()
        expect(throttler.store.state.errorCount).toBe(1)
        expect(throttler.store.state.successCount).toBe(0)
        expect(throttler.store.state.settleCount).toBe(1)
      })

      it('should call onSettled after error', async () => {
        const error = new Error('test error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const onSettled = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          onError,
          onSettled,
        })

        await throttler.maybeExecute()
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(onSettled).toHaveBeenCalledWith([], throttler)
      })

      it('should not break throttling chain after error', async () => {
        const error = new Error('test error')
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success')
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        // First call throws
        await throttler.maybeExecute('first')
        expect(onError).toHaveBeenCalledWith(error, ['first'], throttler)
        expect(throttler.store.state.errorCount).toBe(1)

        // Second call should succeed after wait period
        vi.advanceTimersByTime(100)
        await throttler.maybeExecute('second')
        expect(mockFn).toHaveBeenCalledTimes(2)
        expect(throttler.store.state.successCount).toBe(1)
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should handle multiple consecutive errors', async () => {
        const error1 = new Error('error 1')
        const error2 = new Error('error 2')
        const error3 = new Error('error 3')
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(error1)
          .mockRejectedValueOnce(error2)
          .mockRejectedValueOnce(error3)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        await throttler.maybeExecute('first')
        expect(onError).toHaveBeenNthCalledWith(1, error1, ['first'], throttler)

        vi.advanceTimersByTime(100)
        await throttler.maybeExecute('second')
        expect(onError).toHaveBeenNthCalledWith(
          2,
          error2,
          ['second'],
          throttler,
        )

        vi.advanceTimersByTime(100)
        await throttler.maybeExecute('third')
        expect(onError).toHaveBeenNthCalledWith(3, error3, ['third'], throttler)

        expect(throttler.store.state.errorCount).toBe(3)
        expect(throttler.store.state.successCount).toBe(0)
        expect(throttler.store.state.settleCount).toBe(3)
      })

      it('should maintain last result after error', async () => {
        const error = new Error('test error')
        const mockFn = vi
          .fn()
          .mockResolvedValueOnce('success')
          .mockRejectedValueOnce(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        // First execution - success
        await throttler.maybeExecute('first')
        expect(throttler.store.state.lastResult).toBe('success')

        // Second execution - error
        vi.advanceTimersByTime(100)
        await throttler.maybeExecute('second')
        expect(throttler.store.state.lastResult).toBe('success') // Should maintain last successful result
        expect(throttler.store.state.errorCount).toBe(1)
      })
    })

    describe('Promise Rejection/Resolution Behavior', () => {
      it('should reject promise when throwOnError is true and no onError handler', async () => {
        const error = new Error('test error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: true,
        })

        await expect(throttler.maybeExecute()).rejects.toThrow('test error')
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should reject promise when throwOnError is true with onError handler', async () => {
        const error = new Error('test error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: true,
          onError,
        })

        await expect(throttler.maybeExecute()).rejects.toThrow('test error')
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should resolve with undefined when throwOnError is false', async () => {
        const error = new Error('test error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: false,
          onError,
        })

        const result = await throttler.maybeExecute()
        expect(result).toBeUndefined()
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should reject promise during leading execution with throwOnError=true', async () => {
        const error = new Error('leading error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: true,
          throwOnError: true,
        })

        await expect(throttler.maybeExecute()).rejects.toThrow('leading error')
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should reject promise during trailing execution with throwOnError=true', async () => {
        const error = new Error('trailing error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: false,
          trailing: true,
          throwOnError: true,
        })

        const promise = throttler.maybeExecute()
        vi.advanceTimersByTime(100)
        await expect(promise).rejects.toThrow('trailing error')
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should handle errors with both leading and trailing enabled', async () => {
        const error = new Error('execution error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: true,
          trailing: true,
          throwOnError: true,
        })

        // Leading execution should reject immediately
        await expect(throttler.maybeExecute('first')).rejects.toThrow(
          'execution error',
        )
        expect(throttler.store.state.errorCount).toBe(1)

        // Trailing execution should also reject
        const promise = throttler.maybeExecute('second')
        vi.advanceTimersByTime(100)
        await expect(promise).rejects.toThrow('execution error')
        expect(throttler.store.state.errorCount).toBe(2)
      })

      it('should resolve with undefined during leading execution when throwOnError=false', async () => {
        const error = new Error('leading error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: true,
          throwOnError: false,
          onError,
        })

        const result = await throttler.maybeExecute()
        expect(result).toBeUndefined()
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should resolve with undefined during trailing execution when throwOnError=false', async () => {
        const error = new Error('trailing error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: false,
          trailing: true,
          throwOnError: false,
          onError,
        })

        const promise = throttler.maybeExecute()
        vi.advanceTimersByTime(100)
        const result = await promise
        expect(result).toBeUndefined()
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)
      })
    })

    describe('Flush Error Handling', () => {
      it('should handle errors during flush with throwOnError=true', async () => {
        const error = new Error('flush error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: true,
        })

        await expect(throttler.maybeExecute('first')).rejects.toThrow(
          'flush error',
        ) // Leading execution will throw
        throttler.maybeExecute('second') // This will be pending
        expect(throttler.store.state.isPending).toBe(true)

        await expect(throttler.flush()).rejects.toThrow('flush error')
        expect(throttler.store.state.errorCount).toBe(2) // One from leading, one from flush
        expect(throttler.store.state.isPending).toBe(false)
      })

      it('should handle errors during flush with throwOnError=false', async () => {
        const error = new Error('flush error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: false,
          onError,
        })

        const result1 = await throttler.maybeExecute('first') // Leading execution
        expect(result1).toBeUndefined()
        throttler.maybeExecute('second') // This will be pending
        expect(throttler.store.state.isPending).toBe(true)

        const result = await throttler.flush()
        expect(result).toBeUndefined()
        expect(onError).toHaveBeenCalledTimes(2) // Once for leading, once for flush
        expect(throttler.store.state.errorCount).toBe(2)
        expect(throttler.store.state.isPending).toBe(false)
      })

      it('should resolve pending promise after flush error', async () => {
        const error = new Error('flush error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          onError,
        })

        await throttler.maybeExecute('first')
        const promise = throttler.maybeExecute('second')
        await throttler.flush()

        const result = await promise
        expect(result).toBeUndefined()
        expect(onError).toHaveBeenCalledTimes(2)
      })

      it('should handle flush when no pending execution and function would error', async () => {
        const error = new Error('should not execute')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, { wait: 100 })

        const result = await throttler.flush()
        expect(result).toBeUndefined()
        expect(mockFn).not.toHaveBeenCalled()
        expect(throttler.store.state.errorCount).toBe(0)
      })
    })

    describe('Error Handling with Different Leading/Trailing Combinations', () => {
      it('should handle errors with leading=false, trailing=true', async () => {
        const error = new Error('trailing error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: false,
          trailing: true,
          onError,
        })

        const promise = throttler.maybeExecute()
        expect(mockFn).not.toHaveBeenCalled()
        expect(throttler.store.state.isPending).toBe(true)

        vi.advanceTimersByTime(100)
        await promise
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should handle errors with leading=true, trailing=false', async () => {
        const error = new Error('leading error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          leading: true,
          trailing: false,
          onError,
        })

        await throttler.maybeExecute()
        expect(onError).toHaveBeenCalledWith(error, [], throttler)
        expect(throttler.store.state.errorCount).toBe(1)

        // Second call within wait period should not execute
        throttler.maybeExecute()
        expect(mockFn).toHaveBeenCalledTimes(1)
      })
    })

    describe('Error Handling During Cancellation', () => {
      it('should handle cancellation of erroring promises', async () => {
        const error = new Error('cancelled error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: false,
          onError,
        })

        const result1 = await throttler.maybeExecute('first') // This will error but not throw due to throwOnError=false
        expect(result1).toBeUndefined()
        const promise = throttler.maybeExecute('second')
        throttler.cancel()

        const result = await promise
        expect(result).toBeUndefined()
        expect(mockFn).toHaveBeenCalledTimes(1) // Only first call executed
        expect(throttler.store.state.errorCount).toBe(1)
      })

      it('should cancel pending execution that would error', async () => {
        const error = new Error('pending error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          onError,
        })

        await throttler.maybeExecute('first') // Leading execution errors
        const promise = throttler.maybeExecute('second') // Pending execution
        throttler.cancel()

        const result = await promise
        expect(result).toBeUndefined()
        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(throttler.store.state.errorCount).toBe(1) // Only from leading execution
      })
    })

    describe('Error Handling with Disabled State', () => {
      it('should not execute and return undefined when disabled, even with pending errors', async () => {
        const error = new Error('should not execute')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          enabled: false,
        })

        const result = await throttler.maybeExecute()
        expect(result).toBeUndefined()
        expect(mockFn).not.toHaveBeenCalled()
        expect(throttler.store.state.errorCount).toBe(0)
      })

      it('should cancel execution when disabled mid-wait and function would error', async () => {
        const error = new Error('should not execute')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          onError,
        })

        await throttler.maybeExecute('first') // Leading execution errors
        const promise = throttler.maybeExecute('second') // Pending execution
        throttler.setOptions({ enabled: false })

        const result = await promise
        expect(result).toBeUndefined()
        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(throttler.store.state.errorCount).toBe(1) // Only from leading execution
      })
    })

    describe('Multiple Promise Error Scenarios', () => {
      it('should handle errors when multiple promises are waiting', async () => {
        const error = new Error('multiple promise error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: true,
        })

        await expect(throttler.maybeExecute('first')).rejects.toThrow(
          'multiple promise error',
        )

        const promise1 = throttler.maybeExecute('second')
        const promise2 = throttler.maybeExecute('third')
        const promise3 = throttler.maybeExecute('fourth')

        vi.advanceTimersByTime(100)

        // Only the last promise (promise3) will reject from the trailing execution
        // The earlier promises (promise1, promise2) get resolved by #resolvePreviousPromiseInternal
        const result1 = await promise1
        const result2 = await promise2
        await expect(promise3).rejects.toThrow('multiple promise error')

        expect(result1).toBeUndefined() // Resolved by #resolvePreviousPromiseInternal
        expect(result2).toBeUndefined() // Resolved by #resolvePreviousPromiseInternal
        expect(mockFn).toHaveBeenCalledTimes(2) // Leading + trailing
        expect(mockFn).toHaveBeenLastCalledWith('fourth') // Should use last arguments
      })

      it('should resolve multiple promises when throwOnError=false', async () => {
        const error = new Error('multiple promise error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, {
          wait: 100,
          throwOnError: false,
          onError,
        })

        const result1 = await throttler.maybeExecute('first')
        expect(result1).toBeUndefined()

        const promise1 = throttler.maybeExecute('second')
        const promise2 = throttler.maybeExecute('third')
        const promise3 = throttler.maybeExecute('fourth')

        vi.advanceTimersByTime(100)

        const result2 = await promise1
        const result3 = await promise2
        const result4 = await promise3

        expect(result2).toBeUndefined()
        expect(result3).toBeUndefined()
        expect(result4).toBeUndefined()
        expect(onError).toHaveBeenCalledTimes(2) // Leading + trailing
        expect(throttler.store.state.errorCount).toBe(2)
      })
    })

    describe('Error State Tracking', () => {
      it('should correctly track error and success counts', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('error 1'))
          .mockResolvedValueOnce('success 1')
          .mockRejectedValueOnce(new Error('error 2'))
          .mockResolvedValueOnce('success 2')
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        // First call - error
        await throttler.maybeExecute()
        expect(throttler.store.state.errorCount).toBe(1)
        expect(throttler.store.state.successCount).toBe(0)
        expect(throttler.store.state.settleCount).toBe(1)

        // Second call - success
        vi.advanceTimersByTime(100)
        await throttler.maybeExecute()
        expect(throttler.store.state.errorCount).toBe(1)
        expect(throttler.store.state.successCount).toBe(1)
        expect(throttler.store.state.settleCount).toBe(2)

        // Third call - error
        vi.advanceTimersByTime(100)
        await throttler.maybeExecute()
        expect(throttler.store.state.errorCount).toBe(2)
        expect(throttler.store.state.successCount).toBe(1)
        expect(throttler.store.state.settleCount).toBe(3)

        // Fourth call - success
        vi.advanceTimersByTime(100)
        await throttler.maybeExecute()
        expect(throttler.store.state.errorCount).toBe(2)
        expect(throttler.store.state.successCount).toBe(2)
        expect(throttler.store.state.settleCount).toBe(4)
      })

      it('should maintain correct status after errors', async () => {
        const error = new Error('status error')
        const mockFn = vi.fn().mockRejectedValue(error)
        const onError = vi.fn()
        const throttler = new AsyncThrottler(mockFn, { wait: 100, onError })

        expect(throttler.store.state.status).toBe('idle')

        await throttler.maybeExecute()
        expect(throttler.store.state.status).toBe('settled')
        expect(throttler.store.state.isExecuting).toBe(false)
        expect(throttler.store.state.isPending).toBe(false)
      })
    })
  })
})
