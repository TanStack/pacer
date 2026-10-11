import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncBatcher } from '../src/async-batcher'
import { AsyncDebouncer } from '../src/async-debouncer'
import { AsyncQueuer } from '../src/async-queuer'
import { AsyncRateLimiter } from '../src/async-rate-limiter'
import { AsyncRetryer } from '../src/async-retryer'
import { AsyncThrottler } from '../src/async-throttler'

const kinds = [
  'debouncer',
  'throttler',
  'rateLimiter',
  'queuer',
  'batcher',
] as const
type Kind = (typeof kinds)[number]
type Task = (...args: Array<unknown>) => Promise<string | undefined>

function setup(
  kind: Kind,
  fn: Task,
  retryOptions: {
    throwOnError?: boolean
    enabled?: boolean
    maxExecutionTime?: number
    maxTotalExecutionTime?: number
    maxAttempts?: number
  } = {},
  throwOnError = false,
) {
  const onError = vi.fn()
  const onSuccess = vi.fn()
  const onSettled = vi.fn()
  const options = {
    asyncRetryerOptions: { maxAttempts: 2, baseWait: 0, ...retryOptions },
    initialState: { lastResult: 'last-good' },
    throwOnError,
    onError,
    onSuccess,
    onSettled,
  }
  const instance = (() => {
    switch (kind) {
      case 'debouncer': {
        const utility = new AsyncDebouncer(fn, { ...options, wait: 0 })
        return {
          utility,
          execute: () => {
            const result = utility.maybeExecute('item')
            vi.advanceTimersByTime(0)
            return result
          },
        }
      }
      case 'throttler': {
        const utility = new AsyncThrottler(fn, { ...options, wait: 0 })
        return { utility, execute: () => utility.maybeExecute('item') }
      }
      case 'rateLimiter': {
        const utility = new AsyncRateLimiter(fn, {
          ...options,
          limit: 10,
          window: 100,
        })
        return { utility, execute: () => utility.maybeExecute('item') }
      }
      case 'queuer': {
        const utility = new AsyncQueuer(fn, { ...options, started: false })
        return {
          utility,
          execute: () => {
            utility.addItem('item')
            return utility.execute()
          },
        }
      }
      case 'batcher': {
        const utility = new AsyncBatcher(fn, options)
        return {
          utility,
          execute: () => {
            utility.addItem('item')
            return utility.flush()
          },
        }
      }
    }
  })()
  return { ...instance, onError, onSuccess, onSettled }
}

function deferred() {
  let resolve!: (value: string) => void
  let reject!: (error: Error) => void
  const promise = new Promise<string>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe.each(kinds)('%s retry outcomes', (kind) => {
  it('reports a swallowed final failure as an error and retains the last success', async () => {
    const error = new Error('all attempts failed')
    const fn = vi.fn<Task>().mockRejectedValue(error)
    const { utility, execute, onError, onSuccess, onSettled } = setup(
      kind,
      fn,
      { throwOnError: false },
    )
    await execute()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      error,
      expect.anything(),
      utility,
    )
    expect(utility.store.state).toMatchObject({
      successCount: 0,
      errorCount: 1,
      settleCount: 1,
      lastResult: 'last-good',
      isExecuting: false,
    })
    expect(onSettled).toHaveBeenCalledTimes(1)
    if (utility instanceof AsyncBatcher) {
      expect(utility.store.state).toMatchObject({
        failedItems: ['item'],
        totalItemsFailed: 1,
        totalItemsProcessed: 0,
        items: [],
      })
    }
    if (utility instanceof AsyncQueuer)
      expect(utility.store.state.items).toEqual([])
  })

  it('uses the parent throwOnError policy after a swallowed final failure', async () => {
    const error = new Error('final failure')
    const { execute, onError, onSuccess } = setup(
      kind,
      vi.fn<Task>().mockRejectedValue(error),
      { throwOnError: false },
      true,
    )
    await expect(execute()).rejects.toBe(error)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('does not count a disabled retryer as success or failure', async () => {
    const fn = vi.fn<Task>().mockResolvedValue('unused')
    const { utility, execute, onError, onSuccess, onSettled } = setup(
      kind,
      fn,
      { enabled: false },
    )
    await execute()
    expect(fn).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onSettled).toHaveBeenCalledTimes(1)
    expect(utility.store.state).toMatchObject({
      successCount: 0,
      errorCount: 0,
      settleCount: 1,
      lastResult: 'last-good',
    })
    if (utility instanceof AsyncBatcher)
      expect(utility.store.state).toMatchObject({
        totalItemsProcessed: 0,
        totalItemsFailed: 0,
        failedItems: [],
        items: [],
      })
    if (utility instanceof AsyncQueuer)
      expect(utility.store.state.items).toEqual([])
  })

  it.each(['resolve', 'reject'] as const)(
    'does not count aborted work that later %ss as success or failure',
    async (settlement) => {
      const task = deferred()
      const { utility, execute, onError, onSuccess, onSettled } = setup(
        kind,
        () => task.promise,
      )
      const result = execute()
      utility.abort()
      if (settlement === 'resolve') task.resolve('ignored signal')
      else task.reject(new Error('request failed after abort'))
      await result
      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
      expect(onSettled).toHaveBeenCalledTimes(1)
      expect(utility.store.state).toMatchObject({
        successCount: 0,
        errorCount: 0,
        settleCount: 1,
        lastResult: 'last-good',
        isExecuting: false,
      })
      if (utility instanceof AsyncBatcher)
        expect(utility.store.state).toMatchObject({
          totalItemsProcessed: 0,
          totalItemsFailed: 0,
          failedItems: [],
          items: [],
        })
    },
  )

  it('does not report AbortError as a failure or success', async () => {
    const { utility, execute, onError, onSuccess } = setup(
      kind,
      vi
        .fn<Task>()
        .mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    )
    await execute()
    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(utility.store.state).toMatchObject({
      successCount: 0,
      errorCount: 0,
      lastResult: 'last-good',
    })
  })

  it('keeps a real undefined result as a successful result', async () => {
    const { utility, execute, onError, onSuccess } = setup(
      kind,
      async () => undefined,
    )
    await execute()
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(
      undefined,
      expect.anything(),
      utility,
    )
    expect(onError).not.toHaveBeenCalled()
    expect(utility.store.state).toMatchObject({
      successCount: 1,
      errorCount: 0,
      lastResult: undefined,
    })
  })

  it('counts a retry that succeeds after an error as success', async () => {
    const fn = vi
      .fn<Task>()
      .mockRejectedValueOnce(new Error('retry'))
      .mockResolvedValue('recovered')
    const { utility, execute, onError, onSuccess } = setup(kind, fn)
    await execute()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(
      'recovered',
      expect.anything(),
      utility,
    )
    expect(utility.store.state).toMatchObject({
      successCount: 1,
      errorCount: 0,
      lastResult: 'recovered',
    })
  })

  it.each(['maxExecutionTime', 'maxTotalExecutionTime'] as const)(
    'does not count %s cancellation as a success or failure',
    async (option) => {
      const task = deferred()
      const { utility, execute, onError, onSuccess } = setup(
        kind,
        () => task.promise,
        { [option]: 10 },
      )
      const result = execute()
      await vi.advanceTimersByTimeAsync(10)
      task.resolve('late result')
      await result
      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).not.toHaveBeenCalled()
      expect(utility.store.state).toMatchObject({
        successCount: 0,
        errorCount: 0,
        lastResult: 'last-good',
      })
    },
  )
})

it('preserves the public retryer return and throw policy', async () => {
  const error = new Error('failed')
  expect(
    await new AsyncRetryer(async () => undefined).execute(),
  ).toBeUndefined()
  expect(
    await new AsyncRetryer(async () => 'unused', { enabled: false }).execute(),
  ).toBeUndefined()
  expect(
    await new AsyncRetryer(
      async () => {
        throw error
      },
      { maxAttempts: 1, throwOnError: false },
    ).execute(),
  ).toBeUndefined()
  await expect(
    new AsyncRetryer(
      async () => {
        throw error
      },
      { maxAttempts: 1 },
    ).execute(),
  ).rejects.toBe(error)
})

it.each(kinds)(
  '%s preserves parent success-callback error handling',
  async (kind) => {
    const error = new Error('success callback failed')
    const { execute, utility, onSuccess, onError, onSettled } = setup(
      kind,
      async () => 'saved',
    )
    onSuccess.mockImplementation(() => {
      throw error
    })
    await execute()
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      error,
      expect.anything(),
      utility,
    )
    expect(onSettled).toHaveBeenCalledTimes(1)
    expect(utility.store.state).toMatchObject({
      successCount: 1,
      errorCount: 1,
      lastResult: 'saved',
    })
  },
)

it.each(['rateLimiter', 'batcher'] as const)(
  '%s keeps concurrent execution outcomes separate',
  async (kind) => {
    const first = deferred()
    const second = deferred()
    const error = new Error('older request failed')
    const fn = vi
      .fn<Task>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    const { execute, utility, onSuccess, onError } = setup(kind, fn, {
      maxAttempts: 1,
      throwOnError: false,
    })
    const older = execute()
    const newer = execute()
    second.resolve('new success')
    await newer
    first.reject(error)
    await older
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(
      'new success',
      expect.anything(),
      utility,
    )
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      error,
      expect.anything(),
      utility,
    )
    expect(utility.store.state).toMatchObject({
      successCount: 1,
      errorCount: 1,
      lastResult: 'new success',
    })
  },
)

it('does not confuse an aborted retryer call with the next successful call', async () => {
  const first = deferred()
  const second = deferred()
  const fn = vi
    .fn<Task>()
    .mockImplementationOnce(() => first.promise)
    .mockImplementationOnce(() => second.promise)
  const retryer = new AsyncRetryer(fn)
  const older = retryer.execute()
  const newer = retryer.execute()
  second.resolve('new success')
  expect(await newer).toBe('new success')
  first.resolve('aborted success')
  expect(await older).toBeUndefined()
  expect(retryer.store.state.lastResult).toBe('new success')
})

it.each(['disabled', 'failed', 'aborted'] as const)(
  'expires rate-limiter window state after a %s execution',
  async (mode) => {
    const task = deferred()
    const limiter = new AsyncRateLimiter(() => task.promise, {
      limit: 1,
      window: 100,
      throwOnError: false,
      asyncRetryerOptions: {
        enabled: mode !== 'disabled',
        maxAttempts: 1,
        throwOnError: false,
      },
    })
    const result = limiter.maybeExecute()
    if (mode === 'aborted') limiter.abort()
    if (mode === 'failed') task.reject(new Error('failed'))
    else task.resolve('ignored')
    await result
    expect(limiter.store.state.isExceeded).toBe(true)
    await vi.advanceTimersByTimeAsync(101)
    expect(limiter.store.state.isExceeded).toBe(false)
    expect(limiter.store.state.executionTimes).toEqual([])
  },
)

it('preserves standalone final-attempt timeout rejection', async () => {
  const onError = vi.fn()
  const retryer = new AsyncRetryer(() => new Promise<string>(() => {}), {
    maxExecutionTime: 10,
    maxAttempts: 1,
    throwOnError: true,
    onError,
  })
  const result = expect(retryer.execute()).rejects.toBeInstanceOf(Error)
  await vi.advanceTimersByTimeAsync(10)
  await result
  expect(onError).toHaveBeenCalledTimes(1)
})

it('preserves standalone total-timeout cancellation', async () => {
  const task = deferred()
  const onError = vi.fn()
  const retryer = new AsyncRetryer(() => task.promise, {
    maxTotalExecutionTime: 10,
    throwOnError: true,
    onError,
  })
  const result = retryer.execute()
  await vi.advanceTimersByTimeAsync(10)
  task.resolve('late result')
  expect(await result).toBeUndefined()
  expect(onError).not.toHaveBeenCalled()
})

it.each(['onLastError', 'onSettled'] as const)(
  'preserves exceptions from standalone %s',
  async (callback) => {
    const callbackError = new Error('callback failed')
    const retryer = new AsyncRetryer(
      async () => {
        throw new Error('task failed')
      },
      {
        maxAttempts: 1,
        throwOnError: false,
        [callback]: () => {
          throw callbackError
        },
      },
    )
    await expect(retryer.execute()).rejects.toBe(callbackError)
  },
)

it('does not swallow an undefined value thrown by a final-error callback', async () => {
  const retryer = new AsyncRetryer(
    async () => {
      throw new Error('task failed')
    },
    {
      maxAttempts: 1,
      throwOnError: false,
      onLastError: () => {
        throw undefined
      },
    },
  )
  await expect(retryer.execute()).rejects.toBeUndefined()
})
