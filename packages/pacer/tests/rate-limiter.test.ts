import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RateLimiter, rateLimit } from '../src/rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.store.state.executionCount).toBe(0)
      expect(rateLimiter.store.state.executionTimes).toEqual([])
      expect(rateLimiter.getRemainingInWindow()).toBe(3)
    })

    it('should accept initial state values', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        initialState: {
          executionCount: 5,
        },
      })

      expect(rateLimiter.store.state.executionCount).toBe(5)
      expect(rateLimiter.getRemainingInWindow()).toBe(3)
    })

    it('should update state after execution', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      rateLimiter.maybeExecute()
      expect(rateLimiter.store.state.executionCount).toBe(1)
      expect(rateLimiter.store.state.executionTimes).toHaveLength(1)
      expect(rateLimiter.getRemainingInWindow()).toBe(2)

      rateLimiter.maybeExecute()
      expect(rateLimiter.store.state.executionCount).toBe(2)
      expect(rateLimiter.store.state.executionTimes).toHaveLength(2)
      expect(rateLimiter.getRemainingInWindow()).toBe(1)
    })

    it('should track remaining executions correctly', () => {
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

    it('should not track executions when limit is reached', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute()
      rateLimiter.maybeExecute() // Should not execute

      expect(rateLimiter.store.state.executionCount).toBe(2)
      expect(rateLimiter.store.state.executionTimes).toHaveLength(2)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Options Behavior', () => {
    it('should use default options when not specified', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.options.limit).toBe(3)
      expect(rateLimiter.options.window).toBe(1000)
      expect(rateLimiter.options.enabled).toBe(true)
      expect(rateLimiter.options.windowType).toBe('fixed')
    })

    it('should respect limit option', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should respect window option', () => {
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

    it('should respect enabled option', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 3,
        window: 1000,
        enabled: false,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should respect windowType option with sliding window', () => {
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
      expect(onExecute).toHaveBeenCalledWith([], rateLimiter)
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

    it('should update options with setOptions', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      expect(rateLimiter.options.limit).toBe(3)

      rateLimiter.setOptions({ limit: 5 })
      expect(rateLimiter.options.limit).toBe(5)
    })

    it('should update enabled state dynamically', () => {
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

  describe('Method Execution', () => {
    describe('maybeExecute', () => {
      it('should execute function when within limits', () => {
        const mockFn = vi.fn()
        const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(mockFn).toHaveBeenCalledTimes(1)
      })

      it('should pass arguments to the function', () => {
        const mockFn = vi.fn()
        const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

        rateLimiter.maybeExecute('arg1', 42, { test: 'value' })
        expect(mockFn).toHaveBeenCalledWith('arg1', 42, { test: 'value' })
      })

      it('should reject execution when limit is reached', () => {
        const mockFn = vi.fn()
        const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(rateLimiter.maybeExecute()).toBe(true)
        expect(rateLimiter.maybeExecute()).toBe(false)

        expect(mockFn).toHaveBeenCalledTimes(2)
      })

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
    })

    describe('reset', () => {
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

      it('should reset execution times', () => {
        const mockFn = vi.fn()
        const rateLimiter = new RateLimiter(mockFn, { limit: 2, window: 1000 })

        rateLimiter.maybeExecute()
        rateLimiter.maybeExecute()
        expect(rateLimiter.store.state.executionTimes).toHaveLength(2)

        rateLimiter.reset()
        expect(rateLimiter.store.state.executionTimes).toHaveLength(0)
        expect(rateLimiter.store.state.executionCount).toBe(0)
      })
    })

    describe('getMsUntilNextWindow', () => {
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

  describe('Edge Cases', () => {
    it('should handle rapid consecutive executions', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 3, window: 1000 })

      // Execute rapidly
      for (let i = 0; i < 10; i++) {
        rateLimiter.maybeExecute()
      }

      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(rateLimiter.getRemainingInWindow()).toBe(0)
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

    it('should handle zero limit correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 0, window: 1000 })

      expect(rateLimiter.maybeExecute()).toBe(false)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle very large window values', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, {
        limit: 2,
        window: Number.MAX_SAFE_INTEGER,
      })

      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(true)
      expect(rateLimiter.maybeExecute()).toBe(false)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple resets correctly', () => {
      const mockFn = vi.fn()
      const rateLimiter = new RateLimiter(mockFn, { limit: 1, window: 1000 })

      rateLimiter.maybeExecute()
      rateLimiter.reset()
      rateLimiter.reset()
      rateLimiter.reset()

      expect(rateLimiter.getRemainingInWindow()).toBe(1)
      expect(rateLimiter.maybeExecute()).toBe(true)
    })
  })
})

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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

  it('should work with different options', () => {
    const mockFn = vi.fn()
    const rateLimitedFn = rateLimit(mockFn, {
      limit: 1,
      window: 2000,
      enabled: false,
    })

    rateLimitedFn('test')
    expect(mockFn).not.toHaveBeenCalled()
  })
})
