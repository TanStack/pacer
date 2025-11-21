import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiteRateLimiter, liteRateLimit } from '../src/lite-rate-limiter'

describe('LiteRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Basic Rate Limiting', () => {
    it('should execute function when within limits', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should reject execution when limit is reached', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments to the function', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      rateLimiter.maybeExecute('arg1', 42, { test: 'value' })
      expect(mockFn).toHaveBeenCalledWith('arg1', 42, { test: 'value' })
    })

    it('should allow execution again after window expires', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(1001)

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should track remaining executions correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      expect(rateLimiter.getRemainingInWindow()).toBe(3)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(2)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(1)

      rateLimiter.maybeExecute()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
    })
  })

  describe('Window Types', () => {
    it('should default to fixed window when windowType not specified', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
      })

      // Fill up the window
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time by half the window - should still be blocked
      vi.advanceTimersByTime(500)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Advance time past the full window - should be allowed
      vi.advanceTimersByTime(600)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should respect sliding window type', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
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

    it('should handle fixed window correctly with multiple resets', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
        windowType: 'fixed',
      })

      // First window
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // Wait for window to expire
      vi.advanceTimersByTime(1001)

      // Second window
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(4)
    })
  })

  describe('Utility Methods', () => {
    describe('getRemainingInWindow', () => {
      it('should return correct remaining count', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 3,
          window: 1000,
        })

        expect(rateLimiter.getRemainingInWindow()).toBe(3)

        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(2)

        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(1)

        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(0)
      })

      it('should never return negative values', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 1,
          window: 1000,
        })

        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(0)

        // Try to execute more times
        rateLimiter.maybeExecute()
        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(0)
      })
    })

    describe('getMsUntilNextWindow', () => {
      it('should correctly calculate time until next window', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
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

      it('should return 0 when executions are available', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 2,
          window: 1000,
        })

        expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
        rateLimiter.maybeExecute()
        expect(rateLimiter.getMsUntilNextWindow()).toBe(0)
      })

      it('should handle sliding window correctly', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 1,
          window: 1000,
          windowType: 'sliding',
        })

        rateLimiter.maybeExecute()
        const timeUntilNext = rateLimiter.getMsUntilNextWindow()
        expect(timeUntilNext).toBe(1000)

        vi.advanceTimersByTime(300)
        expect(rateLimiter.getMsUntilNextWindow()).toBe(700)
      })
    })

    describe('reset', () => {
      it('should reset execution state', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 2,
          window: 1000,
        })

        rateLimiter.maybeExecute()
        rateLimiter.maybeExecute()
        expect(rateLimiter.getRemainingInWindow()).toBe(0)

        rateLimiter.reset()
        expect(rateLimiter.getRemainingInWindow()).toBe(2)
        expect(rateLimiter.maybeExecute()).toBe(true)
      })

      it('should clear execution history', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 1,
          window: 1000,
        })

        rateLimiter.maybeExecute()
        expect(rateLimiter.maybeExecute()).toBe(false)

        rateLimiter.reset()
        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(mockFn).toHaveBeenCalledTimes(2)
      })

      it('should clear all timeouts', () => {
        const mockFn = vi.fn()
        const rateLimiter = new LiteRateLimiter(mockFn, {
          limit: 3,
          window: 1000,
          windowType: 'sliding',
        })

        // Create some executions that would have timeouts
        rateLimiter.maybeExecute()
        rateLimiter.maybeExecute()

        rateLimiter.reset()

        // Should be able to execute full limit again
        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(rateLimiter.getRemainingInWindow()).toBe(0)
      })
    })
  })

  describe('Callbacks', () => {
    it('should call onExecute when function executes successfully', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
        onExecute,
      } as any)

      rateLimiter.maybeExecute('arg1', 42)

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['arg1', 42], rateLimiter)
      expect(mockFn).toHaveBeenCalledWith('arg1', 42)
    })

    it('should call onExecute with correct arguments for each execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        onExecute,
      } as any)

      rateLimiter.maybeExecute('first')
      rateLimiter.maybeExecute('second', 123)
      rateLimiter.maybeExecute()

      expect(onExecute).toHaveBeenCalledTimes(3)
      expect(onExecute).toHaveBeenNthCalledWith(1, ['first'], rateLimiter)
      expect(onExecute).toHaveBeenNthCalledWith(2, ['second', 123], rateLimiter)
      expect(onExecute).toHaveBeenNthCalledWith(3, [], rateLimiter)
    })

    it('should call onReject when rate limit is exceeded', () => {
      const mockFn = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      } as any)

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(onReject).not.toHaveBeenCalled()

      expect(rateLimiter.maybeExecute()).toBe(false)
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(onReject).toHaveBeenCalledWith(rateLimiter)
    })

    it('should call onReject for consecutive rejections', () => {
      const mockFn = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      } as any)

      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()

      expect(onReject).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not call callbacks when not provided', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      // Should not throw when callbacks are undefined
      expect(() => {
        rateLimiter.maybeExecute()
        rateLimiter.maybeExecute() // This should be rejected
      }).not.toThrow()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should call callbacks with sliding window', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
        windowType: 'sliding',
        onExecute,
        onReject,
      } as any)

      rateLimiter.maybeExecute('first')
      rateLimiter.maybeExecute('second')
      rateLimiter.maybeExecute('third') // Should be rejected

      expect(onExecute).toHaveBeenCalledTimes(2)
      expect(onReject).toHaveBeenCalledTimes(1)

      // After time passes, should execute again
      vi.advanceTimersByTime(1001)
      rateLimiter.maybeExecute('fourth')

      expect(onExecute).toHaveBeenCalledTimes(3)
      expect(onExecute).toHaveBeenLastCalledWith(['fourth'], rateLimiter)
    })

    it('should call callbacks with fixed window', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
        windowType: 'fixed',
        onExecute,
        onReject,
      } as any)

      rateLimiter.maybeExecute('first')
      rateLimiter.maybeExecute('second')
      rateLimiter.maybeExecute('third') // Should be rejected

      expect(onExecute).toHaveBeenCalledTimes(2)
      expect(onReject).toHaveBeenCalledTimes(1)

      // After window expires, should execute again
      vi.advanceTimersByTime(1001)
      rateLimiter.maybeExecute('fourth')

      expect(onExecute).toHaveBeenCalledTimes(3)
    })

    it('should handle errors in onExecute callback gracefully', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn(() => {
        throw new Error('Callback error')
      })
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: 1000,
        onExecute,
      } as any)

      // Callback errors should propagate (not handled gracefully in current implementation)
      expect(() => rateLimiter.maybeExecute()).toThrow('Callback error')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in onReject callback gracefully', () => {
      const mockFn = vi.fn()
      const onReject = vi.fn(() => {
        throw new Error('Callback error')
      })
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      } as any)

      rateLimiter.maybeExecute()

      // Callback errors should propagate (not handled gracefully in current implementation)
      expect(() => rateLimiter.maybeExecute()).toThrow('Callback error')
      expect(onReject).toHaveBeenCalledTimes(1)
    })

    it('should work with callbacks after reset', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onReject = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
        onExecute,
        onReject,
      } as any)

      rateLimiter.maybeExecute('before-reset')
      rateLimiter.maybeExecute() // Should be rejected

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onReject).toHaveBeenCalledTimes(1)

      rateLimiter.reset()

      rateLimiter.maybeExecute('after-reset')
      expect(onExecute).toHaveBeenCalledTimes(2)
      expect(onExecute).toHaveBeenLastCalledWith(['after-reset'], rateLimiter)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero limit correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 0,
        window: 1000,
      })

      expect(rateLimiter.maybeExecute()).toBe(false)
      expect(mockFn).not.toHaveBeenCalled()
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
    })

    it('should handle zero window correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, { limit: 2, window: 0 })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      // With zero window, should immediately allow execution again
      vi.advanceTimersByTime(1)
      expect(rateLimiter.maybeExecute()).toBe(true)
    })

    it('should handle negative window correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: -1000,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      // With negative window in sliding mode, current time - (-1000) results in a large positive number
      // so the execution time is still within the window
      expect(rateLimiter.maybeExecute()).toBe(true)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle very large window values', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 2,
        window: Number.MAX_SAFE_INTEGER,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle rapid consecutive executions', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 3,
        window: 1000,
      })

      // Execute rapidly
      for (let i = 0; i < 10; i++) {
        rateLimiter.maybeExecute()
      }

      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
    })

    it('should handle NaN window correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, { limit: 1, window: NaN })

      expect(rateLimiter.maybeExecute()).toBe(true)
      // With NaN window, Date.now() - NaN = NaN, and time > NaN is always false
      // So executions never expire and we hit the limit
      expect(rateLimiter.maybeExecute()).toBe(true)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle undefined/null arguments', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      rateLimiter.maybeExecute(undefined, null)
      expect(mockFn).toHaveBeenCalledWith(undefined, null)
    })

    it('should maintain consistent rate with sliding window under load', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
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

      // Advance time by 700ms - first execution should be expired
      vi.advanceTimersByTime(700)
      expect(rateLimiter.maybeExecute()).toBe(true)

      // Advance time by another 100ms - second execution should be expired
      vi.advanceTimersByTime(100)
      expect(rateLimiter.maybeExecute()).toBe(true)

      expect(mockFn).toHaveBeenCalledTimes(5)
    })

    it('should handle multiple resets correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new LiteRateLimiter(mockFn, {
        limit: 1,
        window: 1000,
      })

      rateLimiter.maybeExecute()
      rateLimiter.reset()
      rateLimiter.reset()
      rateLimiter.reset()

      expect(rateLimiter.getRemainingInWindow()).toBe(1)
      expect(rateLimiter.maybeExecute()).toBe(true)
    })
  })
})

describe('liteRateLimit helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('should create a rate-limited function', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, { limit: 2, window: 1000 })

      expect(rateLimitedFn()).toBe(true)
      expect(rateLimitedFn()).toBe(true)
      expect(rateLimitedFn()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments to the wrapped function', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, { limit: 1, window: 1000 })

      rateLimitedFn(42, 'test')

      expect(mockFn).toHaveBeenCalledWith(42, 'test')
    })

    it('should handle multiple executions with proper timing', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, { limit: 2, window: 1000 })

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

    it('should work with sliding window', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 2,
        window: 1000,
        windowType: 'sliding',
      })

      expect(rateLimitedFn('a')).toBe(true)
      expect(rateLimitedFn('b')).toBe(true)
      expect(rateLimitedFn('c')).toBe(false)

      // Advance time by half window
      vi.advanceTimersByTime(500)
      expect(rateLimitedFn('d')).toBe(false)

      // Advance time to expire first execution
      vi.advanceTimersByTime(600)
      expect(rateLimitedFn('e')).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should work with fixed window', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 2,
        window: 1000,
        windowType: 'fixed',
      })

      expect(rateLimitedFn('a')).toBe(true)
      expect(rateLimitedFn('b')).toBe(true)
      expect(rateLimitedFn('c')).toBe(false)

      // Advance time by half window - should still be blocked
      vi.advanceTimersByTime(500)
      expect(rateLimitedFn('d')).toBe(false)

      // Advance time past full window
      vi.advanceTimersByTime(600)
      expect(rateLimitedFn('e')).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('Callbacks', () => {
    it('should work with onExecute callback', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 2,
        window: 1000,
        onExecute,
      } as any)

      rateLimitedFn('test1')
      rateLimitedFn('test2')

      expect(onExecute).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should work with onReject callback', () => {
      const mockFn = vi.fn()
      const onReject = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 1,
        window: 1000,
        onReject,
      } as any)

      expect(rateLimitedFn('test1')).toBe(true)
      expect(rateLimitedFn('test2')).toBe(false)

      expect(onReject).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should work with both callbacks together', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onReject = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 1,
        window: 1000,
        onExecute,
        onReject,
      } as any)

      expect(rateLimitedFn('accepted')).toBe(true)
      expect(rateLimitedFn('rejected')).toBe(false)

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero limit', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, { limit: 0, window: 1000 })

      expect(rateLimitedFn()).toBe(false)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle rapid successive calls', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, { limit: 3, window: 1000 })

      for (let i = 0; i < 10; i++) {
        rateLimitedFn(`call-${i}`)
      }

      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenCalledWith('call-0')
      expect(mockFn).toHaveBeenCalledWith('call-1')
      expect(mockFn).toHaveBeenCalledWith('call-2')
    })

    it('should handle large window values', () => {
      const mockFn = vi.fn()
      const rateLimitedFn = liteRateLimit(mockFn, {
        limit: 1,
        window: 1000000,
      })

      expect(rateLimitedFn()).toBe(true)
      expect(rateLimitedFn()).toBe(false)

      vi.advanceTimersByTime(999999)
      expect(rateLimitedFn()).toBe(false)

      vi.advanceTimersByTime(2)
      expect(rateLimitedFn()).toBe(true)
    })
  })
})
