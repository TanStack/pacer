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
})
