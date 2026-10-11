import { expect, it, vi } from 'vitest'
import { createPacerScope } from '../src'
import { source, flush } from './setup'
it('updates scope defaults, preserves local options, and destroys only once', async () => {
  vi.useFakeTimers()
  const wait = source(false),
    cleanup = vi.fn()
  const scope = createPacerScope(() => ({ debouncer: { enabled: wait.get() } }))
  const inherited = scope.createDebouncer(() => {}, {
    wait: 100,
    onUnmount: cleanup,
  })
  const local = scope.createDebouncer(() => {}, { wait: 25, enabled: false })
  expect(inherited.options.enabled).toBe(false)
  wait.set(true)
  await flush()
  expect(inherited.options.enabled).toBe(true)
  expect(local.options.enabled).toBe(false)
  scope.destroy()
  scope.destroy()
  expect(cleanup).toHaveBeenCalledTimes(1)
  expect(() => scope.createDebouncer(() => {}, { wait: 100 })).toThrow(
    'destroyed',
  )
  vi.useRealTimers()
})
