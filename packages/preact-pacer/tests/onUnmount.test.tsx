import { render } from 'preact'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBatcher } from '../src/batcher/useBatcher'
import { useDebouncer } from '../src/debouncer/useDebouncer'
import { useQueuer } from '../src/queuer/useQueuer'
import { useRateLimiter } from '../src/rate-limiter/useRateLimiter'
import { useThrottler } from '../src/throttler/useThrottler'
import { useAsyncBatcher } from '../src/async-batcher/useAsyncBatcher'
import { useAsyncDebouncer } from '../src/async-debouncer/useAsyncDebouncer'
import { useAsyncQueuer } from '../src/async-queuer/useAsyncQueuer'
import { useAsyncRateLimiter } from '../src/async-rate-limiter/useAsyncRateLimiter'
import { useAsyncThrottler } from '../src/async-throttler/useAsyncThrottler'
import { PacerProvider } from '../src/provider/PacerProvider'
import type { ComponentChildren } from 'preact'

interface Utility {
  store: unknown
}
interface Options {
  onUnmount?: (utility: Utility) => void
  leading?: boolean
  maxSize?: number
  wait?: number
  started?: boolean
}

const hooks = [
  {
    name: 'batcher',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useBatcher(fn, { wait: 1000, ...options }),
  },
  {
    name: 'debouncer',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useDebouncer(fn, { wait: 1000, ...options }),
  },
  {
    name: 'queuer',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useQueuer(fn, { wait: 1000, ...options }),
  },
  {
    name: 'rateLimiter',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useRateLimiter(fn, { limit: 5, window: 1000, ...options }),
  },
  {
    name: 'throttler',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useThrottler(fn, { wait: 1000, ...options }),
  },
  {
    name: 'asyncBatcher',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useAsyncBatcher(async () => fn(), { wait: 1000, ...options }),
  },
  {
    name: 'asyncDebouncer',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useAsyncDebouncer(async () => fn(), { wait: 1000, ...options }),
  },
  {
    name: 'asyncQueuer',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useAsyncQueuer(async () => fn(), { wait: 1000, ...options }),
  },
  {
    name: 'asyncRateLimiter',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useAsyncRateLimiter(async () => fn(), {
        limit: 5,
        window: 1000,
        ...options,
      }),
  },
  {
    name: 'asyncThrottler',
    useUtility: (options: Options, fn: () => unknown = () => undefined) =>
      useAsyncThrottler(async () => fn(), { wait: 1000, ...options }),
  },
]

let container: HTMLDivElement
async function mount(children: ComponentChildren) {
  await act(() => render(children, container))
}
async function unmount() {
  await act(() => render(null, container))
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
})
afterEach(async () => {
  await unmount()
  container.remove()
})

describe.each(hooks)('$name unmount cleanup', ({ name, useUtility }) => {
  let utility: Utility
  function Harness({ options = {} }: { options?: Options }) {
    utility = useUtility(options)
    return null
  }

  it('uses the latest callback without cleaning up on rerenders', async () => {
    const first = vi.fn()
    const latest = vi.fn()
    await mount(<Harness options={{ onUnmount: first }} />)
    const store = utility.store
    await mount(<Harness options={{ onUnmount: latest }} />)
    expect(utility.store).toBe(store)
    expect(first).not.toHaveBeenCalled()
    expect(latest).not.toHaveBeenCalled()
    await unmount()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ store }),
    )
  })

  it('uses a callback added after mounting', async () => {
    const latest = vi.fn()
    await mount(<Harness />)
    await mount(<Harness options={{ onUnmount: latest }} />)
    await unmount()
    expect(latest).toHaveBeenCalledOnce()
  })

  it('does not call a removed callback', async () => {
    const removed = vi.fn()
    await mount(<Harness options={{ onUnmount: removed }} />)
    await mount(<Harness options={{ onUnmount: undefined }} />)
    await unmount()
    expect(removed).not.toHaveBeenCalled()
  })

  it('uses the latest provider default when the hook omits the callback', async () => {
    const first = vi.fn()
    const latest = vi.fn()
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: first } }}>
        <Harness />
      </PacerProvider>,
    )
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: latest } }}>
        <Harness />
      </PacerProvider>,
    )
    await unmount()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
  })

  it('falls back to the provider after removing a hook override', async () => {
    const provider = vi.fn()
    const hook = vi.fn()
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: provider } }}>
        <Harness options={{ onUnmount: hook }} />
      </PacerProvider>,
    )
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: provider } }}>
        <Harness />
      </PacerProvider>,
    )
    await unmount()
    expect(hook).not.toHaveBeenCalled()
    expect(provider).toHaveBeenCalledOnce()
  })

  it('allows explicit undefined to disable a provider callback', async () => {
    const provider = vi.fn()
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: provider } }}>
        <Harness />
      </PacerProvider>,
    )
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: provider } }}>
        <Harness options={{ onUnmount: undefined }} />
      </PacerProvider>,
    )
    await unmount()
    expect(provider).not.toHaveBeenCalled()
  })

  it('honors a hook callback over provider defaults', async () => {
    const provider = vi.fn()
    const hook = vi.fn()
    await mount(
      <PacerProvider defaultOptions={{ [name]: { onUnmount: provider } }}>
        <Harness options={{ onUnmount: hook }} />
      </PacerProvider>,
    )
    await unmount()
    expect(provider).not.toHaveBeenCalled()
    expect(hook).toHaveBeenCalledOnce()
  })
})

// Start real work before removing the callback to verify the fallback actions.
describe.each(hooks)('$name default cleanup', ({ name, useUtility }) => {
  let utility: ReturnType<typeof useUtility>
  const fn = vi.fn<() => unknown>()
  function Harness({ options }: { options: Options }) {
    utility = useUtility(options, fn)
    return null
  }

  it('restores the default when a callback is removed', async () => {
    const removed = vi.fn()
    await mount(<Harness options={{ onUnmount: removed, leading: false }} />)
    await mount(<Harness options={{ onUnmount: undefined, leading: false }} />)
    if ('addItem' in utility) {
      void utility.addItem(1)
    } else {
      void utility.maybeExecute()
    }
    const before = utility.store.state
    await unmount()
    expect(removed).not.toHaveBeenCalled()
    if (name.toLowerCase().includes('queuer')) {
      expect(before).toMatchObject({ isRunning: true })
      expect(utility.store.state).toMatchObject({
        isRunning: false,
        pendingTick: false,
      })
    } else if (name.toLowerCase().includes('ratelimiter')) {
      // Rate limiting has no pending scheduling to cancel. Its history is retained.
      expect(utility.store.state).toMatchObject({
        executionTimes: expect.any(Array),
      })
    } else {
      expect(before).toMatchObject({ isPending: true })
      expect(utility.store.state).toMatchObject({ isPending: false })
    }
  })

  if (name.startsWith('async')) {
    it('aborts an active execution when a callback is removed', async () => {
      let resolve!: () => void
      const pending = new Promise<void>((done) => {
        resolve = done
      })
      fn.mockImplementation(() => pending)
      const removed = vi.fn()
      const options = { leading: true, maxSize: 1, wait: 0, started: true }
      await mount(<Harness options={{ ...options, onUnmount: removed }} />)
      await mount(<Harness options={{ ...options, onUnmount: undefined }} />)
      const execution =
        'addItem' in utility ? utility.addItem(1) : utility.maybeExecute()
      // Read the execution directly; signal lookup indices are a separate core concern.
      const signal =
        'asyncRetryers' in utility
          ? utility.asyncRetryers.values().next().value?.getAbortSignal()
          : null
      expect(signal).not.toBeNull()
      expect(signal?.aborted).toBe(false)
      await unmount()
      expect(removed).not.toHaveBeenCalled()
      expect(signal?.aborted).toBe(true)
      resolve()
      await execution
      fn.mockReset()
    })
  }
})
