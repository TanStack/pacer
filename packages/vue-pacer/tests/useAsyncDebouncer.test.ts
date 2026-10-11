import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAsyncDebouncer } from '../src/async-debouncer/useAsyncDebouncer'
import { setup, source, flush } from './setup'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it.each(['factory', 'getters'] as const)(
  'updates %s options without replacing the instance or store',
  (form) => {
    const version = source(1)
    const first = vi.fn(),
      latest = vi.fn()
    const options = {
      get wait() {
        return version.get() * 100
      },
      get limit() {
        return version.get()
      },
      get maxSize() {
        return version.get() + 10
      },
      window: 1000,
      started: false,
      get onUnmount() {
        return version.get() === 1 ? first : latest
      },
    }
    const { result: utility, destroy } = setup(() =>
      useAsyncDebouncer(
        async () => {},
        form === 'factory' ? () => ({ ...options }) : options,
      ),
    )
    const store = utility.store
    expect(utility.options).toMatchObject({ wait: 100 })
    version.set(2)
    flush()
    expect(utility.store).toBe(store)
    expect(utility.options).toMatchObject({ wait: 200, limit: 2, maxSize: 12 })
    expect(utility.state.value).toEqual({})
    destroy()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledExactlyOnceWith(utility)
  },
)

it('selects published state and releases subscriptions on disposal', () => {
  const { result: utility, destroy } = setup(() =>
    useAsyncDebouncer(
      async () => {},
      { wait: 100 },
      (state) => state.settleCount,
    ),
  )
  expect(utility.state.value).toBe(0)
  utility.store.setState((state) => ({ ...state, settleCount: 3 }))
  flush()
  expect(utility.state.value).toBe(3)
  destroy()
  utility.store.setState((state) => ({ ...state, settleCount: 4 }))
  expect(utility.state.value).toBe(3)
})

it('executes through the adapter with the core scheduling semantics', async () => {
  const calls: Array<string | Array<string>> = []
  const { result: utility, destroy } = setup(() =>
    useAsyncDebouncer(
      async (value: string) => {
        calls.push(value)
      },
      { wait: 100 },
    ),
  )
  void utility.maybeExecute('first')
  void utility.maybeExecute('last')
  await vi.runAllTimersAsync()
  await flush()
  expect(calls).toEqual(['last'])
  destroy()
})

it('aborts active asynchronous work when its owner is disposed', async () => {
  let resolve!: () => void
  const pending = new Promise<void>((done) => {
    resolve = done
  })
  const { result: utility, destroy } = setup(() =>
    useAsyncDebouncer(() => pending, { wait: 0, leading: true }),
  )
  let aborted = false
  utility.setOptions({
    asyncRetryerOptions: {
      onAbort: () => {
        aborted = true
      },
    },
  })
  const execution = utility.maybeExecute()

  expect(aborted).toBe(false)
  destroy()
  expect(aborted).toBe(true)
  resolve()
  await execution
})
