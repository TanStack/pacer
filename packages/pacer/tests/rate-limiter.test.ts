import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RateLimiter, rateLimit } from '../src/rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic rate limiting', () => {
    it('should allow execution within limits', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should reset after window expires', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(1001)

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('execution tracking', () => {
    it('should track total execution count', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

      rateLimiter.maybeExecute()
      expect(rateLimiter.getExecutionCount()).toBe(1)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getExecutionCount()).toBe(2)

      // This should not increment the count
      rateLimiter.maybeExecute()
      expect(rateLimiter.getExecutionCount()).toBe(2)
    })

    it('should track remaining executions', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.getRemainingInWindow()).toBe(3)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(2)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(1)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
    })
  })

  describe('reset functionality', () => {
    it('should reset execution state', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)

      rateLimiter.reset()
      expect(rateLimiter.getRemainingInWindow()).toBe(2)
      expect(rateLimiter.maybeExecute()).toBe(true)
    })
  })

  describe('rateLimit helper function', () => {
    it('should create a rate-limited function', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = rateLimit(mockFn, { limit: 2, window: 1000 })

      expect(rateLimitedFn()).toBe(true)
      expect(rateLimitedFn()).toBe(true)
      expect(rateLimitedFn()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments to the wrapped function', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = rateLimit(mockFn, { limit: 1, window: 1000 })

      rateLimitedFn(42, 'test')

      expect(mockFn).toHaveBeenCalledWith(42, 'test')
    })

    it('should handle multiple executions with proper timing', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = rateLimit(mockFn, { limit: 2, window: 1000 })

      // First burst
      expect(rateLimitedFn('a')).toBe(true)
      expect(rateLimitedFn('b')).toBe(true)
      expect(rateLimitedFn('c')).toBe(false)
      expect(mockFn).toHaveBeenCalledTimes(2)

      // Advance past window
      vi.advanceTimersByTime(1001)

      // Should be able to execute again
      expect(rateLimitedFn('d')).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenLastCalledWith('d')
    })
  })

  describe('sliding window functionality', () => {
    it('should allow executions as old ones expire', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        windowType: 'sliding',
      })

      // Fill up the window
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time by 500ms - oldest execution should still be in window
      vi.advanceTimersByTime(500)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time by 600ms more - oldest execution should be expired
      vi.advanceTimersByTime(600)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(4)
    })

    it('should maintain consistent rate with sliding window', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        windowType: 'sliding',
      })

      // Execute 3 times
      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()

      // Advance time by 400ms
      vi.advanceTimersByTime(400)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time by 700ms - one execution should be expired
      vi.advanceTimersByTime(700)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(4)
    })
  })

  describe('enabled/disabled state', () => {
    it('should not execute when disabled', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        enabled: false,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should update enabled state', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        enabled: false,
      })

      rateLimiter.maybeExecute()
      expect(mockFn).not.toHaveBeenCalled()

      rateLimiter.setOptions({ enabled: true })
      rateLimiter.maybeExecute()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('callback functions', () => {
    it('should call onExecute callback after successful execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onExecute,
      })

      rateLimiter.maybeExecute()
      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(rateLimiter)
    })

    it('should call onReject callback when execution is rejected', () => {
      const mockFn = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      })

      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(onReject).toHaveBeenCalledWith(rateLimiter)
    })
  })

  describe('time tracking', () => {
    it('should correctly calculate time until next window', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      rateLimiter.maybeExecute()
      expect(rateLimiter.getMsUntilNextWindow()).toBe(1000)

      vi.advanceTimersByTime(500)
      expect(rateLimiter.getMsUntilNextWindow()).toBe(500)

      vi.advanceTimersByTime(500)
      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
    })

    it('should return 0 ms when executions are available', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
      rateLimiter.maybeExecute()
      expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
    })
  })
})
