import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AsyncDebouncer } from '../src/async-debouncer'
import { AsyncThrottler } from '../src/async-throttler'
import { AsyncQueuer } from '../src/async-queuer'
import { AsyncBatcher } from '../src/async-batcher'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})
const tick = () => vi.advanceTimersByTimeAsync(0)
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

it('scheduled call survives earlier execution completion', async () => {
  const a = deferred<number>()
  const calls: number[] = []
  const d = new AsyncDebouncer(
    async (n: number) => {
      calls.push(n)
      return n === 1 ? a.promise : n
    },
    { wait: 50 },
  )
  d.maybeExecute(1)
  await vi.advanceTimersByTimeAsync(50)
  d.maybeExecute(2)
  a.resolve(1)
  await tick()
  await vi.advanceTimersByTimeAsync(50)
  expect(calls).toEqual([1, 2])
})

it('executing debouncer can obtain its signal', async () => {
  let signal: AbortSignal | null | undefined
  const d = new AsyncDebouncer(
    async () => {
      signal = d.getAbortSignal()
      return 1
    },
    { wait: 10 },
  )
  d.maybeExecute()
  await vi.advanceTimersByTimeAsync(10)
  expect(signal).toBeInstanceOf(AbortSignal)
})

it('throttler signal survives newer waiting call', async () => {
  const a = deferred<number>()
  const t = new AsyncThrottler(async () => a.promise, { wait: 50 })
  const first = t.maybeExecute()
  const signal = t.getAbortSignal()
  t.maybeExecute()
  expect(t.getAbortSignal()).toBe(signal)
  a.resolve(1)
  await first
})

for (const kind of ['debouncer', 'throttler'] as const) {
  it(`${kind}: running call does not settle with stale result on next schedule`, async () => {
    const a = deferred<number>()
    const Ctor = kind === 'debouncer' ? AsyncDebouncer : AsyncThrottler
    const obj = new Ctor(async (n: number) => (n === 1 ? a.promise : n), {
      wait: 50,
      leading: false,
    })
    let settled = false
    const first = obj.maybeExecute(1).then((x) => {
      settled = true
      return x
    })
    await vi.advanceTimersByTimeAsync(50)
    obj.maybeExecute(2)
    await tick()
    expect.soft(settled).toBe(false)
    a.resolve(1)
    await tick()
    expect(await first).toBe(1)
  })
  it(`${kind}: flush does not duplicate running trailing work`, async () => {
    const a = deferred<number>()
    const fn = vi.fn(async () => a.promise)
    const Ctor = kind === 'debouncer' ? AsyncDebouncer : AsyncThrottler
    const obj = new Ctor(fn, { wait: 50, leading: false })
    obj.maybeExecute()
    await vi.advanceTimersByTimeAsync(50)
    obj.flush()
    expect.soft(fn).toHaveBeenCalledTimes(1)
    expect.soft(obj.store.state.isPending).toBe(false)
    expect(obj.store.state.status).toBe('executing')
    a.resolve(1)
  })
}

for (const kind of ['debouncer', 'throttler', 'batcher'] as const) {
  it(`${kind}: isExecuting stays true while any execution is active`, async () => {
    const first = deferred<number>()
    const second = deferred<number>()
    let call = 0
    const fn = async () => (++call === 1 ? first.promise : second.promise)
    let obj:
      | AsyncDebouncer<typeof fn>
      | AsyncThrottler<typeof fn>
      | AsyncBatcher<number>
    if (kind === 'debouncer') {
      obj = new AsyncDebouncer(fn, { wait: 10 })
      obj.maybeExecute()
      await vi.advanceTimersByTimeAsync(10)
      obj.maybeExecute()
      await vi.advanceTimersByTimeAsync(10)
    } else if (kind === 'throttler') {
      obj = new AsyncThrottler(fn, { wait: 10 })
      obj.maybeExecute()
      obj.maybeExecute()
      await vi.advanceTimersByTimeAsync(10)
    } else {
      obj = new AsyncBatcher(fn, { maxSize: 1 })
      obj.addItem(1)
      obj.addItem(2)
    }
    first.resolve(1)
    await tick()
    expect.soft(call).toBe(2)
    expect.soft(obj.store.state.isExecuting).toBe(true)
    second.resolve(2)
    await tick()
    expect(obj.store.state.isExecuting).toBe(false)
  })
}

it('reset must not let old batch remove active retryer', async () => {
  const first = deferred<number>()
  const second = deferred<number>()
  const b = new AsyncBatcher<number>(
    async (items) => (items[0] === 1 ? first.promise : second.promise),
    { maxSize: 1 },
  )
  b.addItem(1)
  b.reset()
  b.addItem(2)
  const signal = b.getAbortSignal()
  first.resolve(1)
  await tick()
  expect.soft(b.asyncRetryers.size).toBe(1)
  expect.soft(b.store.state.isExecuting).toBe(true)
  b.abort()
  expect.soft(signal?.aborted).toBe(true)
  second.resolve(2)
  await tick()
})

for (const kind of ['debouncer', 'throttler'] as const) {
  it(`${kind}: default signal follows active executions, explicit IDs remain stable`, async () => {
    const first = deferred<number>()
    const second = deferred<number>()
    const Ctor = kind === 'debouncer' ? AsyncDebouncer : AsyncThrottler
    const obj = new Ctor(
      async (n: number) => (n === 1 ? first.promise : second.promise),
      { wait: 10 },
    )
    obj.maybeExecute(1)
    await vi.advanceTimersByTimeAsync(10)
    const firstSignal = obj.getAbortSignal(1)
    expect.soft(firstSignal).toBeInstanceOf(AbortSignal)
    obj.maybeExecute(2)
    expect.soft(obj.getAbortSignal()).toBe(firstSignal)
    await vi.advanceTimersByTimeAsync(10)
    const secondSignal = obj.getAbortSignal(2)
    expect.soft(secondSignal).toBeInstanceOf(AbortSignal)
    expect.soft(secondSignal).not.toBe(firstSignal)
    expect.soft(obj.getAbortSignal()).toBe(secondSignal)
    second.resolve(2)
    await tick()
    expect.soft(obj.getAbortSignal()).toBe(firstSignal)
    first.resolve(1)
    await tick()
    expect(obj.getAbortSignal()).toBeNull()
  })
}

it.each([0, 100])(
  'starts newly added queue items with wait %i while a concurrency slot is free',
  async (wait) => {
    const work = deferred<number>()
    const fn = vi.fn(async () => work.promise)
    const queuer = new AsyncQueuer(fn, { concurrency: 2, wait })
    queuer.addItem('a')
    queuer.addItem('b')
    expect.soft(fn).toHaveBeenCalledTimes(2)
    expect.soft(queuer.store.state.activeItems).toEqual(['a', 'b'])
    expect.soft(queuer.store.state.items).toEqual([])
    work.resolve(1)
    await tick()
  },
)

it('does not bypass a queue wait timer when a new item arrives', async () => {
  const fn = vi.fn(async () => undefined)
  const queuer = new AsyncQueuer(fn, { concurrency: 2, wait: 100 })
  queuer.addItem('a')
  await tick()
  await vi.advanceTimersByTimeAsync(50)
  queuer.addItem('b')
  expect(fn).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(49)
  expect(fn).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(fn).toHaveBeenCalledTimes(2)
})

it.each(['older first', 'newer first'] as const)(
  'keeps batches distinct across reset when %s finishes',
  async (order) => {
    const first = deferred<number>()
    const second = deferred<number>()
    const batcher = new AsyncBatcher<number>(
      async (items) => (items[0] === 1 ? first.promise : second.promise),
      { maxSize: 1 },
    )
    const firstRun = batcher.addItem(1)
    const firstSignal = batcher.getAbortSignal(1)
    batcher.reset()
    expect(batcher.store.state.isExecuting).toBe(true)
    expect(batcher.store.state.executionCount).toBe(0)
    expect(batcher.getAbortSignal(1)).toBeNull()
    expect(batcher.getAbortSignal()).toBe(firstSignal)
    const secondRun = batcher.addItem(2)
    const secondSignal = batcher.getAbortSignal(1)
    expect(secondSignal).not.toBe(firstSignal)
    expect(batcher.store.state.executionCount).toBe(1)

    if (order === 'older first') {
      first.resolve(1)
      await firstRun
      expect(batcher.getAbortSignal(1)).toBe(secondSignal)
      expect(batcher.asyncRetryers.size).toBe(1)
      expect(batcher.getAbortSignal()).toBe(secondSignal)
      second.resolve(2)
    } else {
      second.resolve(2)
      await secondRun
      expect(batcher.getAbortSignal(1)).toBeNull()
      expect(batcher.asyncRetryers.size).toBe(0)
      expect(batcher.getAbortSignal()).toBe(firstSignal)
      first.resolve(1)
    }
    expect(batcher.store.state.isExecuting).toBe(true)
    expect(await firstRun).toBe(1)
    expect(await secondRun).toBe(2)
    expect(batcher.store.state.isExecuting).toBe(false)
    expect(batcher.store.state.settleCount).toBe(2)
    expect(batcher.store.state.successCount).toBe(2)
    expect(batcher.getAbortSignal()).toBeNull()
    expect(batcher.asyncRetryers.size).toBe(0)
  },
)

it('aborts all active batches after repeated resets', async () => {
  const work = deferred<number>()
  const batcher = new AsyncBatcher<number>(async () => work.promise, {
    maxSize: 1,
  })
  const first = batcher.addItem(1)
  const firstSignal = batcher.getAbortSignal()
  batcher.reset()
  const second = batcher.addItem(2)
  const secondSignal = batcher.getAbortSignal()
  batcher.reset()
  expect(batcher.store.state.isExecuting).toBe(true)
  expect(batcher.asyncRetryers.size).toBe(0)
  batcher.abort()
  expect(firstSignal?.aborted).toBe(true)
  expect(secondSignal?.aborted).toBe(true)
  expect(batcher.getAbortSignal()).toBeNull()
  expect(batcher.store.state.isExecuting).toBe(false)
  work.resolve(1)
  await Promise.all([first, second])
  expect(batcher.asyncRetryers.size).toBe(0)
})

it('does not exceed queue concurrency when an executing task adds items', async () => {
  const work = deferred<number>()
  const fn = vi.fn(async (item: string) => {
    if (item === 'a') {
      queuer.addItem('b')
      queuer.addItem('c')
    }
    return work.promise
  })
  const queuer = new AsyncQueuer(fn, { concurrency: 2, wait: 0 })
  queuer.addItem('a')
  expect(fn.mock.calls).toEqual([['a'], ['b']])
  expect(queuer.store.state.activeItems).toEqual(['a', 'b'])
  expect(queuer.store.state.items).toEqual(['c'])
  work.resolve(1)
  await tick()
  expect(fn.mock.calls).toEqual([['a'], ['b'], ['c']])
  expect(queuer.store.state.activeItems).toEqual([])
})

for (const kind of ['debouncer', 'throttler'] as const) {
  it(`${kind}: preserves executing ownership when reset reuses a call count`, async () => {
    const first = deferred<number>()
    const second = deferred<number>()
    const Ctor = kind === 'debouncer' ? AsyncDebouncer : AsyncThrottler
    const utility = new Ctor(
      async (value: number) => (value === 1 ? first.promise : second.promise),
      { wait: 0, leading: true },
    )
    const firstRun = utility.maybeExecute(1)
    const firstSignal = utility.getAbortSignal()
    utility.reset()
    expect.soft(utility.store.state.isExecuting).toBe(true)
    expect.soft(utility.getAbortSignal(1)).toBeNull()
    const secondRun = utility.maybeExecute(2)
    const secondSignal = utility.getAbortSignal()
    first.resolve(1)
    await firstRun
    expect.soft(utility.store.state.isExecuting).toBe(true)
    expect.soft(utility.getAbortSignal()).toBe(secondSignal)
    expect.soft(utility.getAbortSignal(1)).toBe(secondSignal)
    utility.abort()
    expect.soft(secondSignal?.aborted).toBe(true)
    expect.soft(firstSignal?.aborted).toBe(false)
    second.resolve(2)
    await secondRun
    expect(utility.store.state.isExecuting).toBe(false)
  })
}
