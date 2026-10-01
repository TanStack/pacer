import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AsyncQueuer } from '../src/async-queuer'
import { AsyncRateLimiter } from '../src/async-rate-limiter'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const tick = () => vi.advanceTimersByTimeAsync(0)

for (const kind of ['queuer', 'rate limiter'] as const) {
  it.each(['older first', 'newer first'] as const)(
    `${kind}: keeps executions distinct across reset when %s settles`,
    async (order) => {
      const first = deferred<number>(),
        second = deferred<number>()
      const fn = async (value: number) =>
        value === 1 ? first.promise : second.promise
      const utility =
        kind === 'queuer'
          ? new AsyncQueuer(fn, { concurrency: 2 })
          : new AsyncRateLimiter(fn, { limit: 1, window: 1000 })
      const execute = (value: number) => {
        if (utility instanceof AsyncQueuer) utility.addItem(value)
        else void utility.maybeExecute(value)
      }
      execute(1)
      const firstSignal = utility.getAbortSignal(1)
      utility.reset()
      expect.soft(utility.store.state.isExecuting).toBe(true)
      expect.soft(utility.asyncRetryers.size).toBe(0)
      expect.soft(utility.getAbortSignal(1)).toBeNull()
      expect.soft(utility.getAbortSignal()).toBe(firstSignal)
      execute(2)
      const secondSignal = utility.getAbortSignal(1)
      expect.soft(secondSignal).toBeInstanceOf(AbortSignal)
      expect.soft(secondSignal).not.toBe(firstSignal)
      expect.soft(utility.getAbortSignal()).toBe(secondSignal)

      if (order === 'older first') {
        first.resolve(1)
        await tick()
        expect.soft(utility.getAbortSignal(1)).toBe(secondSignal)
        expect.soft(utility.getAbortSignal()).toBe(secondSignal)
        expect.soft(utility.asyncRetryers.size).toBe(1)
        if (utility instanceof AsyncQueuer)
          expect.soft(utility.store.state.activeItems).toEqual([2])
      } else {
        second.resolve(2)
        await tick()
        expect.soft(utility.getAbortSignal(1)).toBeNull()
        expect.soft(utility.getAbortSignal()).toBe(firstSignal)
        expect.soft(utility.asyncRetryers.size).toBe(0)
        if (utility instanceof AsyncQueuer)
          expect.soft(utility.store.state.activeItems).toEqual([1])
      }
      expect.soft(utility.store.state.isExecuting).toBe(true)
      first.resolve(1)
      second.resolve(2)
      await tick()
      expect(utility.store.state).toMatchObject({
        isExecuting: false,
        successCount: 2,
        settleCount: 2,
      })
      expect(utility.asyncRetryers.size).toBe(0)
      expect(utility.getAbortSignal()).toBeNull()
      if (utility instanceof AsyncQueuer)
        expect(utility.store.state).toMatchObject({
          activeItems: [],
          isIdle: true,
        })
    },
  )

  it(`${kind}: abort reaches executions before repeated resets`, async () => {
    const work = deferred<number>()
    const utility =
      kind === 'queuer'
        ? new AsyncQueuer<number>(async () => work.promise, { concurrency: 2 })
        : new AsyncRateLimiter(async (_value: number) => work.promise, {
            limit: 1,
            window: 1000,
          })
    const execute = (value: number) => {
      if (utility instanceof AsyncQueuer) utility.addItem(value)
      else void utility.maybeExecute(value)
    }
    execute(1)
    const firstSignal = utility.getAbortSignal()
    utility.reset()
    execute(2)
    const secondSignal = utility.getAbortSignal()
    utility.reset()
    expect.soft(utility.store.state.isExecuting).toBe(true)
    expect.soft(utility.asyncRetryers.size).toBe(0)
    expect.soft(utility.getAbortSignal()).toBe(secondSignal)
    utility.abort()
    expect.soft(firstSignal?.aborted).toBe(true)
    expect.soft(secondSignal?.aborted).toBe(true)
    expect.soft(utility.getAbortSignal()).toBeNull()
    expect.soft(utility.store.state.isExecuting).toBe(false)
    work.resolve(1)
    await tick()
    expect(utility.asyncRetryers.size).toBe(0)
    if (utility instanceof AsyncQueuer)
      expect(utility.store.state.activeItems).toEqual([])
  })
}

it('keeps reset queue executions in their concurrency slots and clears waiting items', async () => {
  const first = deferred<number>(),
    second = deferred<number>()
  const fn = vi.fn(async (value: string) =>
    value === 'first' ? first.promise : second.promise,
  )
  const queue = new AsyncQueuer(fn, { concurrency: 1, wait: 100, maxSize: 1 })
  queue.addItem('first')
  queue.addItem('discarded')
  queue.stop()
  queue.reset()
  expect.soft(queue.store.state).toMatchObject({
    activeItems: ['first'],
    items: [],
    isRunning: true,
    isExecuting: true,
    isIdle: false,
    executionCount: 0,
    addItemCount: 0,
  })
  queue.addItem('second')
  expect.soft(fn.mock.calls).toEqual([['first']])
  expect
    .soft(queue.store.state)
    .toMatchObject({ items: ['second'], isFull: true })
  first.resolve(1)
  await tick()
  expect.soft(queue.store.state.isExecuting).toBe(false)
  await vi.advanceTimersByTimeAsync(99)
  expect.soft(fn.mock.calls).toEqual([['first']])
  await vi.advanceTimersByTimeAsync(1)
  expect.soft(fn.mock.calls).toEqual([['first'], ['second']])
  expect.soft(queue.store.state).toMatchObject({
    activeItems: ['second'],
    isExecuting: true,
    executionCount: 1,
  })
  second.resolve(2)
  await tick()
  expect(queue.store.state.activeItems).toEqual([])
})

it('does not bypass an existing queue wait timer after reset', async () => {
  const fn = vi.fn(async () => undefined)
  const queue = new AsyncQueuer(fn, { concurrency: 2, wait: 100 })
  queue.addItem('first')
  await tick()
  await vi.advanceTimersByTimeAsync(50)
  queue.reset()
  queue.addItem('second')
  expect.soft(queue.store.state.pendingTick).toBe(true)
  expect.soft(fn).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(49)
  expect.soft(fn).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(fn).toHaveBeenCalledTimes(2)
})

it('releases one concurrency slot when duplicate pre-reset items finish', async () => {
  const tasks = Array.from({ length: 4 }, () => deferred<number>())
  let invocation = 0
  const fn = vi.fn(async (_value: string) => tasks[invocation++]!.promise)
  const queue = new AsyncQueuer(fn, { concurrency: 2 })
  queue.addItem('same')
  queue.addItem('same')
  queue.reset()
  queue.addItem('third')
  queue.addItem('fourth')
  expect.soft(fn.mock.calls).toEqual([['same'], ['same']])
  expect.soft(queue.store.state.activeItems).toEqual(['same', 'same'])
  tasks[0]!.resolve(1)
  await tick()
  expect.soft(fn.mock.calls).toEqual([['same'], ['same'], ['third']])
  expect.soft(queue.store.state.activeItems).toEqual(['same', 'third'])
  tasks[2]!.resolve(3)
  await tick()
  expect.soft(queue.store.state.activeItems).toEqual(['same', 'fourth'])
  const newestSignal = queue.getAbortSignal()
  tasks[1]!.resolve(2)
  await tick()
  expect.soft(queue.store.state.activeItems).toEqual(['fourth'])
  expect.soft(queue.getAbortSignal()).toBe(newestSignal)
  tasks[3]!.resolve(4)
  await tick()
  expect(queue.store.state).toMatchObject({
    activeItems: [],
    items: [],
    isExecuting: false,
    isIdle: true,
  })
})

it('keeps the latest active limiter signal when a newer call is rate limited', async () => {
  const work = deferred<number>()
  const limiter = new AsyncRateLimiter(async () => work.promise, {
    limit: 1,
    window: 1000,
  })
  const running = limiter.maybeExecute()
  const signal = limiter.getAbortSignal()
  expect(await limiter.maybeExecute()).toBeUndefined()
  expect.soft(limiter.getAbortSignal()).toBe(signal)
  limiter.abort()
  expect(signal?.aborted).toBe(true)
  work.resolve(1)
  await running
})

it('does not let manual pre-reset work release a newer automatic slot with the same value', async () => {
  const tasks = Array.from({ length: 3 }, () => deferred<number>())
  let invocation = 0
  const fn = vi.fn(async (_value: string) => tasks[invocation++]!.promise)
  const queue = new AsyncQueuer(fn, { concurrency: 1, started: false })
  queue.addItem('same')
  const manual = queue.execute()
  queue.reset()
  queue.addItem('same')
  queue.addItem('waiting')
  tasks[0]!.resolve(1)
  await manual
  expect.soft(queue.store.state.activeItems).toEqual(['same'])
  queue.start()
  expect.soft(fn.mock.calls).toEqual([['same'], ['same']])
  tasks[1]!.resolve(2)
  await tick()
  expect.soft(fn.mock.calls).toEqual([['same'], ['same'], ['waiting']])
  tasks[2]!.resolve(3)
  await tick()
  expect(queue.store.state).toMatchObject({
    activeItems: [],
    items: [],
    isExecuting: false,
  })
})
