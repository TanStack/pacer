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
    expect(onError).toHaveBeenCalledWith(error, throttler)
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

  it('should cancel pending execution', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call executes immediately
    throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    // Start a throttled call
    const promise = throttler.maybeExecute('second')
    // Cancel it immediately
    throttler.cancel()

    // Wait for the promise to settle
    await expect(promise).resolves.toBeUndefined()
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')
  })

  it('should allow new executions after cancel', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    throttler.maybeExecute('first')
    const promise = throttler.maybeExecute('second')
    throttler.cancel()
    await promise

    vi.advanceTimersByTime(100)
    await throttler.maybeExecute('third')

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
    expect(mockFn).toHaveBeenNthCalledWith(2, 'third')
  })

  it('should handle multiple cancel calls safely', async () => {
    const mockFn = vi.fn().mockResolvedValue(undefined)
    const throttler = new AsyncThrottler(mockFn, { wait: 100 })

    // First call should execute
    throttler.maybeExecute('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('first')

    // Second call should be cancelled
    const promise = throttler.maybeExecute('second')
    throttler.cancel()
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
    throttler.cancel()

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
      expect(await promise).toBe('result')
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
})
