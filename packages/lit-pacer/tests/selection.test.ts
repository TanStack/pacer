import { expect, it } from 'vitest'
import { createDebouncer } from '../src'
import { setup, source, flush } from './setup'

it('refreshes a selection when its reactive inputs change without a store update', async () => {
  const offset = source(1)
  const { result: utility, destroy } = setup((owner) =>
    createDebouncer(
      owner,
      () => {},
      { wait: 100 },
      (state) => ({ count: state.executionCount + offset.get() }),
    ),
  )
  try {
    await flush()
    expect(utility.state.count).toBe(1)
    offset.set(2)
    await flush()
    expect(utility.store.state.executionCount).toBe(0)
    expect(utility.state.count).toBe(2)
  } finally {
    destroy()
  }
  offset.set(3)
  await flush()
  expect(utility.state.count).toBe(2)
})
