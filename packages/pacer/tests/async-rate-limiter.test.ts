import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncRateLimiter, asyncRateLimit } from '../src/async-rate-limiter'

describe('AsyncRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic rate limiting', () => {
    it('should allow execution within limits', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should reset after window expires', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()

      // Advance time past the window
      vi.advanceTimersByTime(1001)

      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('execution tracking', () => {
    it('should track success and error counts', async () => {
      const mockFn = vi
        .fn()
        .mockResolvedValueOnce('success1')
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValueOnce('success2')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getSuccessCount()).toBe(1)
      expect(rateLimiter.getErrorCount()).toBe(0)

      await rateLimiter.maybeExecute().catch(() => {})
      expect(rateLimiter.getSuccessCount()).toBe(1)
      expect(rateLimiter.getErrorCount()).toBe(1)

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getSuccessCount()).toBe(2)
      expect(rateLimiter.getErrorCount()).toBe(1)
    })

    it('should track remaining executions', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      expect(rateLimiter.getRemainingInWindow()).toBe(3)

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(2)

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(1)

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
    })
  })

  describe('reset functionality', () => {
    it('should reset execution state', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      await rateLimiter.maybeExecute()
      await rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)

      rateLimiter.reset()
      expect(rateLimiter.getRemainingInWindow()).toBe(2)
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
    })
  })

  describe('asyncRateLimit helper function', () => {
    it('should create a rate-limited function', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimitedFn = asyncRateLimit(mockFn, { limit: 2, window: 1000 })

      await expect(rateLimitedFn()).resolves.toBe('result')
      await expect(rateLimitedFn()).resolves.toBe('result')
      await expect(rateLimitedFn()).resolves.toBeUndefined()

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments to the wrapped function', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimitedFn = asyncRateLimit(mockFn, { limit: 1, window: 1000 })

      await rateLimitedFn(42, 'test')

      expect(mockFn).toHaveBeenCalledWith(42, 'test')
    })

    it('should handle multiple executions with proper timing', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimitedFn = asyncRateLimit(mockFn, { limit: 2, window: 1000 })

      // First burst
      await expect(rateLimitedFn('a')).resolves.toBe('result')
      await expect(rateLimitedFn('b')).resolves.toBe('result')
      await expect(rateLimitedFn('c')).resolves.toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(2)

      // Advance past window
      vi.advanceTimersByTime(1001)

      // Should be able to execute again
      await expect(rateLimitedFn('d')).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenLastCalledWith('d')
    })
  })

  describe('sliding window functionality', () => {
    it('should allow executions as old ones expire', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        windowType: 'sliding',
      })

      // Fill up the window
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()

      // Advance time by 500ms - oldest execution should still be in window
      vi.advanceTimersByTime(500)
      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()

      // Advance time by 600ms more - oldest execution should be expired
      vi.advanceTimersByTime(600)
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(4)
    })

    it('should maintain consistent rate with sliding window', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        windowType: 'sliding',
      })

      // Execute 3 times
      await rateLimiter.maybeExecute()
      await rateLimiter.maybeExecute()
      await rateLimiter.maybeExecute()

      // Advance time by 400ms
      vi.advanceTimersByTime(400)
      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()

      // Advance time by 700ms - one execution should be expired
      vi.advanceTimersByTime(700)
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(4)
    })
  })

  describe('enabled/disabled state', () => {
    it('should not execute when disabled', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        enabled: false,
      })

      await expect(rateLimiter.maybeExecute()).resolves.toBeUndefined()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should update enabled state', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        enabled: false,
      })

      await rateLimiter.maybeExecute()
      expect(mockFn).not.toHaveBeenCalled()

      rateLimiter.setOptions({ enabled: true })
      await expect(rateLimiter.maybeExecute()).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('callback functions', () => {
    it('should call onSuccess callback after successful execution', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onSuccess = vi.fn()
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onSuccess,
      })

      await rateLimiter.maybeExecute()
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith('result', rateLimiter)
    })

    it('should call onError callback when execution fails', async () => {
      const error = new Error('test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onError,
      })

      await rateLimiter.maybeExecute().catch(() => {})
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(error, rateLimiter)
    })

    it('should call onSettled callback after execution completes', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onSettled = vi.fn()
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onSettled,
      })

      await rateLimiter.maybeExecute()
      expect(onSettled).toHaveBeenCalledTimes(1)
      expect(onSettled).toHaveBeenCalledWith(rateLimiter)
    })

    it('should call onReject callback when execution is rejected', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const onReject = vi.fn()
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      })

      await rateLimiter.maybeExecute()
      await rateLimiter.maybeExecute()
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(onReject).toHaveBeenCalledWith(rateLimiter)
    })
  })

  describe('time tracking', () => {
    it('should correctly calculate time until next window', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      await rateLimiter.maybeExecute()
      expect(rateLimiter.getMsUntilNextWindow()).toBe(1000)

      vi.advanceTimersByTime(500)
      expect(rateLimiter.getMsUntilNextWindow()).toBe(500)

      vi.advanceTimersByTime(500)
      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
    })

    it('should return 0 ms when executions are available', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
      await rateLimiter.maybeExecute()
      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
    })
  })

  describe('async-specific behavior', () => {
    it('should handle concurrent executions properly', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'result'
      })
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      // Start multiple executions concurrently
      const promises = [
        rateLimiter.maybeExecute(),
        rateLimiter.maybeExecute(),
        rateLimiter.maybeExecute(),
      ]

      // Advance timers to resolve the promises
      await vi.advanceTimersByTimeAsync(100)

      // All promises should resolve, but only 2 should execute
      const results = await Promise.all(promises)
      expect(results.filter((r) => r === 'result')).toHaveLength(2)
      expect(results).toContain(undefined)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle long-running executions correctly', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return 'result'
      })
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      // Start a long-running execution
      const promise1 = rateLimiter.maybeExecute()

      // Try to execute again while the first one is still running
      const promise2 = rateLimiter.maybeExecute()

      // Advance timers to resolve the promises
      await vi.advanceTimersByTimeAsync(500)

      // Both should execute since they're within the limit
      const [result1, result2] = await Promise.all([promise1, promise2])
      expect(result1).toBe('result')
      expect(result2).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle cancellation of async operations', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'result'
      })
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      // Start an execution
      const promise = rateLimiter.maybeExecute()

      // Reset the rate limiter while the execution is pending
      rateLimiter.reset()

      // Advance timers to resolve the promise
      await vi.advanceTimersByTimeAsync(100)

      // The original promise should still resolve
      await expect(promise).resolves.toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid async executions with sliding window', async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return 'result'
      })
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        windowType: 'sliding',
      })

      // Start multiple executions rapidly
      const promises = Array.from({ length: 5 }, () =>
        rateLimiter.maybeExecute(),
      )

      // Advance timers to resolve all promises
      await vi.advanceTimersByTimeAsync(50)

      const results = await Promise.all(promises)

      // Should have 3 successes and 2 undefined (rejected)
      expect(results.filter((r) => r === 'result')).toHaveLength(3)
      expect(results.filter((r) => r === undefined)).toHaveLength(2)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should maintain proper execution order with async operations', async () => {
      const results: Array<string> = []
      const mockFn = vi.fn().mockImplementation(async (id: string) => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        results.push(id)
        return id
      })
      const rateLimiter = new AsyncRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      // Start executions in sequence
      const promise1 = rateLimiter.maybeExecute('first')
      const promise2 = rateLimiter.maybeExecute('second')
      const promise3 = rateLimiter.maybeExecute('third')

      // Advance timers to resolve all promises
      await vi.advanceTimersByTimeAsync(100)

      await Promise.all([promise1, promise2, promise3])

      // Results should maintain the order of execution
      expect(results).toEqual(['first', 'second'])
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })
})
