import { expect, it, vi } from 'vitest'
import { createDebouncer, providePacerOptions } from '../src'
import { setup, source, flush } from './setup'
it('updates host defaults and reconnects without replacing the utility', async () => {
  const wait = source(false),
    cleanup = vi.fn()
  const {
    result: utility,
    host,
    destroy,
  } = setup((owner) => {
    providePacerOptions(owner, () => ({ debouncer: { enabled: wait.get() } }))
    return createDebouncer(
      owner,
      () => {},
      { wait: 100, onUnmount: cleanup },
      (state) => state.executionCount,
    )
  })
  await flush()
  expect(utility.options.enabled).toBe(false)
  wait.set(true)
  await flush()
  expect(utility.options.enabled).toBe(true)
  host.remove()
  expect(cleanup).toHaveBeenCalledTimes(1)
  document.body.append(host)
  await flush()
  utility.store.setState((state) => ({ ...state, executionCount: 5 }))
  await flush()
  expect(utility.state).toBe(5)
  destroy()
  expect(cleanup).toHaveBeenCalledTimes(2)
})
