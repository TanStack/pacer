import { createComponent, createMemo, createRoot, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import { createDebouncedValue } from '../src/debouncer/createDebouncedValue'
import { createDebouncer } from '../src/debouncer/createDebouncer'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

it('waits for an async option instead of throwing', async () => {
  let resolve!: (wait: number) => void
  const { debouncer, held, dispose } = createRoot((dispose) => {
    const wait = createMemo(() => new Promise<number>((r) => (resolve = r)))
    const debouncer = createDebouncer(
      () => {},
      () => ({ wait: wait(), key: 'search' }),
      (state) => ({ executionCount: state.executionCount }),
    )
    // Solid checks a memo's value for a promise while the debouncer is
    // still pending.
    return { dispose, debouncer, held: createMemo(() => debouncer) }
  })
  flush()

  resolve(300)
  await tick()
  flush()
  expect(debouncer.key).toBe('search')
  expect(debouncer.options.wait).toBe(300)
  expect(debouncer.state().executionCount).toBe(0)
  expect(held()).toBe(debouncer)
  dispose()
})

it('waits for an async value instead of throwing', async () => {
  let resolve!: (value: string) => void
  const { value, dispose } = createRoot((dispose) => {
    const source = createMemo(() => new Promise<string>((r) => (resolve = r)))
    const [value] = createDebouncedValue(source, { wait: 100 })
    return { dispose, value: createMemo(() => value()) }
  })
  flush()

  resolve('ready')
  await tick()
  flush()
  expect(value()).toBe('ready')
  dispose()
})

it('reads in a component body do not warn', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const dispose = createRoot((dispose) => {
    createComponent(() => {
      const { maybeExecute, options } = createDebouncer(() => {}, {
        wait: 100,
      })
      void maybeExecute
      void options
      return undefined
    }, {})
    return dispose
  })
  flush()
  const strict = warn.mock.calls.filter((args) =>
    String(args[0]).includes('STRICT_READ_UNTRACKED'),
  )
  warn.mockRestore()
  expect(strict).toEqual([])
  dispose()
})
