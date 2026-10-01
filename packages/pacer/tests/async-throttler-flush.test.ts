import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AsyncThrottler } from '../src/async-throttler'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const tick = () => vi.advanceTimersByTimeAsync(0)

it.each(['older first', 'newer first'] as const)(
  'keeps a flushed caller attached to its execution when %s finishes',
  async (order) => {
    const first = deferred<number>(),
      second = deferred<number>()
    const throttler = new AsyncThrottler(
      async (value: number) => (value === 1 ? first.promise : second.promise),
      { leading: false, wait: 0 },
    )
    let originalSettled = false
    const original = throttler.maybeExecute(1).then((value) => {
      originalSettled = true
      return value
    })
    const flushed = throttler.flush()
    const next = throttler.maybeExecute(2)
    await tick()
    expect.soft(originalSettled).toBe(false)
    if (order === 'older first') {
      first.resolve(1)
      await tick()
      expect.soft(throttler.store.state.isExecuting).toBe(true)
      second.resolve(2)
    } else {
      second.resolve(2)
      await tick()
      expect.soft(originalSettled).toBe(false)
      first.resolve(1)
    }
    expect(await flushed).toBe(1)
    expect(await original).toBe(1)
    expect(await next).toBe(2)
  },
)

it('cancel does not settle a caller whose work is already running from flush', async () => {
  const work = deferred<number>()
  const fn = vi.fn(async () => work.promise)
  const throttler = new AsyncThrottler(fn, { leading: false, wait: 50 })
  let originalSettled = false
  const original = throttler.maybeExecute().then((value) => {
    originalSettled = true
    return value
  })
  const flushed = throttler.flush()
  throttler.cancel()
  await tick()
  expect.soft(originalSettled).toBe(false)
  expect.soft(throttler.store.state.isExecuting).toBe(true)
  work.resolve(1)
  expect(await flushed).toBe(1)
  expect(await original).toBe(1)
  expect(fn).toHaveBeenCalledTimes(1)
})

it('rejects both the original caller and flush when the execution fails', async () => {
  const work = deferred<number>()
  const error = new Error('flush failed')
  const throttler = new AsyncThrottler(async () => work.promise, {
    leading: false,
    wait: 50,
    throwOnError: true,
  })
  const rejected = vi.fn()
  const original = throttler.maybeExecute().catch(rejected)
  const flushed = expect(throttler.flush()).rejects.toBe(error)
  work.reject(error)
  await flushed
  await tick()
  expect(rejected).toHaveBeenCalledExactlyOnceWith(error)
  await original
})

it('keeps newer pending work cancelable after the flushed call completes', async () => {
  const work = deferred<number>()
  const fn = vi.fn(async (value: number) =>
    value === 1 ? work.promise : value,
  )
  const throttler = new AsyncThrottler(fn, { leading: false, wait: 0 })
  const original = throttler.maybeExecute(1)
  const flushed = throttler.flush()
  const next = throttler.maybeExecute(2)
  work.resolve(1)
  expect(await flushed).toBe(1)
  throttler.cancel()
  expect(await next).toBe(1)
  await original
  await tick()
  expect(fn.mock.calls).toEqual([[1]])
})

it('resolves both callers with lastResult when flush errors are handled', async () => {
  const work = deferred<number>()
  const onError = vi.fn()
  const throttler = new AsyncThrottler(async () => work.promise, {
    leading: false,
    wait: 50,
    onError,
    initialState: { lastResult: 7 },
  })
  let originalSettled = false
  const original = throttler.maybeExecute().then((value) => {
    originalSettled = true
    return value
  })
  const flushed = throttler.flush()
  await tick()
  expect(originalSettled).toBe(false)
  const error = new Error('handled flush failure')
  work.reject(error)
  expect(await flushed).toBe(7)
  expect(await original).toBe(7)
  expect(onError).toHaveBeenCalledExactlyOnceWith(error, [], throttler)
})
