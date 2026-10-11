import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createQueuer } from '../src/queuer/createQueuer'
import { setup, source, flush } from './setup'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it.each(['factory', 'getters'] as const)(
  'updates %s options without replacing the instance or store',
  async (form) => {
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
    const { result: utility, destroy } = setup((owner) =>
      createQueuer(
        owner,
        () => {},
        form === 'factory' ? () => ({ ...options }) : options,
      ),
    )
    const store = utility.store
    expect(utility.options).toMatchObject({ wait: 100 })
    version.set(2)
    await flush()
    expect(utility.store).toBe(store)
    expect(utility.options).toMatchObject({ wait: 200, limit: 2, maxSize: 12 })
    expect(utility.state).toEqual({})
    destroy()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledExactlyOnceWith(utility)
  },
)

it('selects published state and releases subscriptions on disposal', async () => {
  const { result: utility, destroy } = setup((owner) =>
    createQueuer(
      owner,
      () => {},
      { wait: 100, started: false },
      (state) => state.executionCount,
    ),
  )
  expect(utility.state).toBe(0)
  utility.store.setState((state) => ({ ...state, executionCount: 3 }))
  await flush()
  expect(utility.state).toBe(3)
  destroy()
  utility.store.setState((state) => ({ ...state, executionCount: 4 }))
  expect(utility.state).toBe(3)
})

it('executes through the adapter with the core scheduling semantics', async () => {
  const calls: Array<string | Array<string>> = []
  const { result: utility, destroy } = setup((owner) =>
    createQueuer(
      owner,
      (value: string) => {
        calls.push(value)
      },
      { wait: 100, started: false },
    ),
  )
  utility.addItem('first')
  utility.addItem('last')
  expect(utility.store.state.items).toEqual(['first', 'last'])
  utility.start()
  await vi.runAllTimersAsync()
  await flush()
  expect(calls).toEqual(['first', 'last'])
  destroy()
})
