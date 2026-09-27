import { assertType, describe, expect, it } from 'vitest'
import { AsyncBatcher, AsyncQueuer } from '../src'
import type {
  AsyncBatcherState,
  AsyncDebouncerState,
  AsyncQueuerState,
  AsyncRateLimiterState,
  AsyncRetryerState,
  AsyncThrottlerState,
  BatcherState,
  DebouncerState,
  QueuerState,
  RateLimiterState,
  ThrottlerState,
} from '../src'

it('keeps shared state names consistent across utilities', () => {
  type AsyncFn = () => Promise<void>
  type BatcherKeys =
    | 'executionCount'
    | 'isEmpty'
    | 'isPending'
    | 'items'
    | 'size'
    | 'totalItemsProcessed'
  type QueuerKeys =
    | 'executionCount'
    | 'addItemCount'
    | 'expirationCount'
    | 'isEmpty'
    | 'isFull'
    | 'isIdle'
    | 'isRunning'
    | 'items'
    | 'itemTimestamps'
    | 'pendingTick'
    | 'rejectionCount'
    | 'size'
  type AsyncOutcomeKeys = 'errorCount' | 'settleCount' | 'successCount'
  type AsyncState =
    | AsyncBatcherState<unknown>
    | AsyncDebouncerState<AsyncFn>
    | AsyncQueuerState<unknown>
    | AsyncRateLimiterState<AsyncFn>
    | AsyncThrottlerState<AsyncFn>
  type ExecutionState =
    | BatcherState<unknown>
    | QueuerState<unknown>
    | DebouncerState<() => void>
    | ThrottlerState<() => void>
    | RateLimiterState
    | AsyncBatcherState<unknown>
    | AsyncQueuerState<unknown>
    | AsyncRetryerState<AsyncFn>
  type MaybeExecuteState =
    | DebouncerState<() => void>
    | ThrottlerState<() => void>
    | RateLimiterState
    | AsyncDebouncerState<AsyncFn>
    | AsyncThrottlerState<AsyncFn>
    | AsyncRateLimiterState<AsyncFn>

  // keyof a union contains only keys shared by every member.
  assertType<'executionCount' extends keyof ExecutionState ? true : false>(true)
  assertType<
    BatcherKeys extends keyof (
      BatcherState<unknown> | AsyncBatcherState<unknown>
    )
      ? true
      : false
  >(true)
  assertType<
    QueuerKeys extends keyof (QueuerState<unknown> | AsyncQueuerState<unknown>)
      ? true
      : false
  >(true)
  assertType<AsyncOutcomeKeys extends keyof AsyncState ? true : false>(true)
  assertType<
    'maybeExecuteCount' extends keyof MaybeExecuteState ? true : false
  >(true)
})

describe.each(['batcher', 'queuer'] as const)('%s counters', (kind) => {
  it('preserves seeded execution IDs and abort signals across overlapping executions', async () => {
    const releases: Array<() => void> = []
    const fn = () => new Promise<void>((resolve) => releases.push(resolve))
    const options = {
      started: false,
      initialState: { executionCount: 7, settleCount: 3 },
    }
    const util =
      kind === 'batcher'
        ? new AsyncBatcher<number>(fn, options)
        : new AsyncQueuer<number>(fn, options)
    const execute = () =>
      util instanceof AsyncBatcher ? util.flush() : util.execute()

    util.addItem(1)
    const first = execute()
    expect(util.store.state.executionCount).toBe(8)
    expect(util.store.state.settleCount).toBe(3)
    const firstSignal = util.getAbortSignal(8)
    expect(firstSignal).not.toBeNull()

    util.addItem(2)
    const second = execute()
    expect(util.store.state.executionCount).toBe(9)
    expect(util.getAbortSignal()).toBe(util.getAbortSignal(9))
    expect(util.getAbortSignal(9)).not.toBe(firstSignal)
    expect([...util.asyncRetryers.keys()]).toEqual([8, 9])
    expect(util.store.state).not.toHaveProperty('executeCount')
    expect(util.store.state).not.toHaveProperty('settledCount')

    releases.forEach((resolve) => resolve())
    await Promise.all([first, second])
    expect(util.store.state.settleCount).toBe(5)
    expect(util.asyncRetryers.size).toBe(0)
    expect(util.getAbortSignal()).toBeNull()

    util.reset()
    expect(util.store.state.executionCount).toBe(0)
    expect(util.store.state.settleCount).toBe(0)
  })

  it('counts failed executions as settled', async () => {
    const fn = () => Promise.reject(new Error('expected failure'))
    const options = { started: false, throwOnError: false }
    const util =
      kind === 'batcher'
        ? new AsyncBatcher<number>(fn, options)
        : new AsyncQueuer<number>(fn, options)
    util.addItem(1)
    await (util instanceof AsyncBatcher ? util.flush() : util.execute())
    expect(util.store.state.executionCount).toBe(1)
    expect(util.store.state.settleCount).toBe(1)
    expect(util.store.state.errorCount).toBe(1)
    expect(util.store.state.successCount).toBe(0)
  })
})
