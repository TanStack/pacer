import { describe, expect, it, vi } from 'vitest'
import { AsyncRetryer } from '../src/async-retryer'
import { AsyncRateLimiter } from '../src/async-rate-limiter'

describe('async error normalization', () => {
  it.each([
    [{ message: 'readable error', code: 'E001' }, 'readable error'],
    [
      Object.assign(Object.create(null), { message: 'input failure' }),
      'input failure',
    ],
    [{ message: 42 }, '[object Object]'],
    ['request failed', 'request failed'],
    [42, '42'],
    [null, 'null'],
    [undefined, 'undefined'],
    [Symbol('failure'), 'Symbol(failure)'],
  ])(
    'preserves the message and cause of %s',
    async (original: unknown, message) => {
      const onError = vi.fn()
      const retryer = new AsyncRetryer(() => Promise.reject(original), {
        maxAttempts: 1,
        throwOnError: true,
        onError,
      })
      const failure = await retryer.execute().catch((error: unknown) => error)
      expect(failure).toBeInstanceOf(Error)
      expect(failure).toHaveProperty('message', message)
      expect((failure as Error).cause).toBe(original)
      expect(onError).toHaveBeenCalledWith(failure, [], retryer)
      expect(retryer.store.state.lastError).toBe(failure)
    },
  )

  it('retains an Error instance and its existing cause', async () => {
    const error = new Error('failure', { cause: 'original cause' })
    const retryer = new AsyncRetryer(() => Promise.reject(error), {
      maxAttempts: 1,
    })
    await expect(retryer.execute()).rejects.toBe(error)
    expect(error.cause).toBe('original cause')
  })

  it('passes the normalized error to the parent when the retryer swallows it', async () => {
    const original = { message: 'readable parent failure' }
    const onError = vi.fn()
    const limiter = new AsyncRateLimiter(() => Promise.reject(original), {
      limit: 1,
      window: 100,
      throwOnError: false,
      onError,
      asyncRetryerOptions: { maxAttempts: 1, throwOnError: false },
    })
    await limiter.maybeExecute()
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      message: original.message,
      cause: original,
    })
    expect(limiter.store.state.successCount).toBe(0)
    expect(limiter.store.state.errorCount).toBe(1)
    limiter.reset()
  })
})
