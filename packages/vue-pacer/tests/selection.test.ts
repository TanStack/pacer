import { expect, it } from 'vitest'
import { useDebouncer } from '../src'
import { setup, source, flush } from './setup'

it('refreshes a selection when its reactive inputs change without a store update', async () => {
  const offset = source(1)
  const { result: utility, destroy } = setup(() =>
    useDebouncer(
      () => {},
      { wait: 100 },
      (state) => ({ count: state.executionCount + offset.get() }),
    ),
  )
  try {
    await flush()
    expect(utility.state.value.count).toBe(1)
    offset.set(2)
    await flush()
    expect(utility.store.state.executionCount).toBe(0)
    expect(utility.state.value.count).toBe(2)
  } finally {
    destroy()
  }
  offset.set(3)
  await flush()
  expect(utility.state.value.count).toBe(2)
})

it('tracks a different reactive input after the store changes the selector branch', async () => {
  const first = source(1)
  const second = source(1)
  const { result: utility, destroy } = setup(() =>
    useDebouncer(
      () => {},
      { wait: 100 },
      (state) => (state.executionCount === 0 ? first.get() : second.get()),
    ),
  )
  try {
    await flush()
    utility.store.setState((state) => ({ ...state, executionCount: 1 }))
    await flush()
    // The branch changes while the selected value remains equal.
    expect(utility.state.value).toBe(1)
    second.set(2)
    await flush()
    expect(utility.state.value).toBe(2)
  } finally {
    destroy()
  }
})
