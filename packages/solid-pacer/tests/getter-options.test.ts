import {
  createComponent,
  createComputed,
  createRoot,
  createSignal,
} from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDebouncer } from '../src/debouncer/createDebouncer'
import { createRateLimiter } from '../src/rate-limiter/createRateLimiter'
import { createQueuer } from '../src/queuer/createQueuer'
import { PacerProvider } from '../src/provider/PacerProvider'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('uses an updated getter limit for the next execution without replacing the store', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let limiter!: ReturnType<typeof createRateLimiter>
  createRoot((cleanup) => {
    dispose = cleanup
    const [limit, setLimit] = createSignal(1)
    update = setLimit
    limiter = createRateLimiter(() => {}, {
      get limit() {
        return limit()
      },
      window: 1000,
    })
  })
  const store = limiter.store
  expect(limiter.maybeExecute()).toBe(true)
  expect(limiter.maybeExecute()).toBe(false)
  update(2)
  expect(limiter.maybeExecute()).toBe(true)
  expect(limiter.store).toBe(store)
  dispose()
})

it.each(['factory', 'object'] as const)(
  'tracks provider property getters with %s options',
  (form) => {
    let dispose = () => {},
      update = (_value: number) => {}
    let utility!: ReturnType<typeof createDebouncer>
    createRoot((cleanup) => {
      dispose = cleanup
      const [wait, setWait] = createSignal(100)
      update = setWait
      createComponent(PacerProvider, {
        defaultOptions: {
          get debouncer() {
            return { leading: wait() === 100 }
          },
        },
        get children() {
          utility = createDebouncer(
            () => {},
            form === 'factory' ? () => ({ wait: 100 }) : { wait: 100 },
          )
          return null
        },
      })
    })
    const store = utility.store
    update(200)
    expect(utility.options.leading).toBe(false)
    expect(utility.store).toBe(store)
    dispose()
  },
)

it('tracks replacement provider defaultOptions and preserves instance options precedence', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let utility!: ReturnType<typeof createDebouncer>
  createRoot((cleanup) => {
    dispose = cleanup
    const [wait, setWait] = createSignal(100)
    update = setWait
    createComponent(PacerProvider, {
      get defaultOptions() {
        return { debouncer: { trailing: wait() === 100, leading: true } }
      },
      get children() {
        utility = createDebouncer(() => {}, { wait: 100, leading: false })
        return null
      },
    })
  })
  update(200)
  expect(utility.options).toMatchObject({
    wait: 100,
    leading: false,
    trailing: false,
  })
  dispose()
})

it('tracks getters within provider utility defaults', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let utility!: ReturnType<typeof createDebouncer>
  createRoot((cleanup) => {
    dispose = cleanup
    const [wait, setWait] = createSignal(100)
    update = setWait
    createComponent(PacerProvider, {
      defaultOptions: {
        debouncer: {
          get leading() {
            return wait() === 100
          },
        },
      },
      get children() {
        utility = createDebouncer(() => {}, { wait: 100 })
        return null
      },
    })
  })
  update(200)
  expect(utility.options.leading).toBe(false)
  dispose()
})

it.each(['omit', 'undefined', 'manual'] as const)(
  'keeps cleanup consistent with partial options when using %s',
  (mode) => {
    const callback = vi.fn(),
      first = vi.fn(),
      manual = vi.fn()
    let dispose = () => {},
      update = (_value: boolean) => {}
    let utility!: ReturnType<typeof createDebouncer<typeof callback>>
    createRoot((cleanup) => {
      dispose = cleanup
      const [initial, setInitial] = createSignal(true)
      update = setInitial
      utility = createDebouncer(callback, () => ({
        wait: 100,
        ...(initial()
          ? { onUnmount: first }
          : mode === 'undefined'
            ? { onUnmount: undefined }
            : {}),
      }))
    })
    utility.maybeExecute()
    update(false)
    if (mode === 'manual') utility.setOptions({ onUnmount: manual })
    expect(utility.options.onUnmount).toBe(
      mode === 'undefined' ? undefined : mode === 'manual' ? manual : first,
    )
    dispose()
    expect(first).toHaveBeenCalledTimes(mode === 'omit' ? 1 : 0)
    expect(manual).toHaveBeenCalledTimes(mode === 'manual' ? 1 : 0)
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(mode === 'undefined' ? 0 : 1)
  },
)

it('keeps partial merge semantics for omitted and explicit undefined options', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let utility!: ReturnType<typeof createDebouncer>
  createRoot((cleanup) => {
    dispose = cleanup
    const [version, setVersion] = createSignal(0)
    update = setVersion
    utility = createDebouncer(
      () => {},
      () => ({
        wait: 100,
        ...(version() === 0
          ? { leading: true }
          : version() === 2
            ? { leading: undefined }
            : {}),
      }),
    )
  })
  update(1)
  expect(utility.options.leading).toBe(true)
  update(2)
  expect(utility.options.leading).toBeUndefined()
  dispose()
})

it('constructs once without tracking internal function-valued options or invoking callbacks', () => {
  const onExecute = vi.fn(),
    dynamicLimit = vi.fn()
  let dispose = () => {},
    updateWindow = (_value: number) => {},
    updateLimit = (_value: number) => {}
  let utility!: ReturnType<typeof createRateLimiter>
  let constructions = 0
  createRoot((cleanup) => {
    dispose = cleanup
    const [window, setWindow] = createSignal(1000)
    const [limit, setLimit] = createSignal(1)
    updateWindow = setWindow
    updateLimit = setLimit
    dynamicLimit.mockImplementation(() => limit())
    createComputed(() => {
      constructions++
      utility = createRateLimiter(() => {}, {
        get window() {
          return window()
        },
        limit: dynamicLimit,
        onExecute,
      })
    })
  })
  const original = utility,
    store = utility.store
  dynamicLimit.mockClear()
  updateWindow(2000)
  updateLimit(2)
  expect(constructions).toBe(1)
  expect(utility).toBe(original)
  expect(utility.store).toBe(store)
  expect(utility.options.limit).toBe(dynamicLimit)
  expect(dynamicLimit).not.toHaveBeenCalled()
  expect(onExecute).not.toHaveBeenCalled()
  expect(utility.maybeExecute()).toBe(true)
  expect(utility.maybeExecute()).toBe(true)
  expect(utility.maybeExecute()).toBe(false)
  expect(onExecute).toHaveBeenCalledTimes(2)
  dispose()
})

it('consumes key, initial items and nested initial state once', () => {
  let dispose = () => {},
    update = (_value: number) => {}
  let utility!: ReturnType<typeof createQueuer<string>>
  const initialCount = vi.fn(() => 4)
  createRoot((cleanup) => {
    dispose = cleanup
    const [version, setVersion] = createSignal(1)
    update = setVersion
    utility = createQueuer((_item: string) => {}, {
      get wait() {
        return version() * 100
      },
      get key() {
        return `getter-queue-${version()}`
      },
      get initialItems() {
        return [`item-${version()}`]
      },
      initialState: {
        get executionCount() {
          return initialCount()
        },
      },
      started: false,
    })
  })
  const store = utility.store
  expect(utility.store.state.items).toEqual(['item-1'])
  const initialReads = initialCount.mock.calls.length
  expect(initialReads).toBeGreaterThan(0)
  update(2)
  expect(utility.key).toBe('getter-queue-1')
  expect(utility.store).toBe(store)
  expect(utility.store.state.items).toEqual(['item-1'])
  expect(utility.store.state.executionCount).toBe(4)
  expect(initialCount).toHaveBeenCalledTimes(initialReads)
  dispose()
})

it.each(['fallback', 'clear'] as const)(
  'uses typed provider cleanup for %s options',
  (mode) => {
    const callback = vi.fn(),
      customCleanup = vi.fn(),
      providerCleanup = vi.fn()
    let dispose = () => {},
      update = (_value: boolean) => {}
    let utility!: ReturnType<
      typeof createDebouncer<typeof callback, { pending: boolean }>
    >
    createRoot((cleanup) => {
      dispose = cleanup
      const [custom, setCustom] = createSignal(true)
      update = setCustom
      createComponent(PacerProvider, {
        defaultOptions: {
          debouncer: {
            onUnmount(received) {
              expect(received).toBe(utility)
              expect(received.state()).toEqual({ pending: true })
              providerCleanup(received)
              received.cancel()
            },
          },
        },
        get children() {
          utility = createDebouncer(
            callback,
            () => ({
              wait: 100,
              ...(custom()
                ? { onUnmount: customCleanup }
                : mode === 'clear'
                  ? { onUnmount: undefined }
                  : {}),
            }),
            (state) => ({ pending: state.isPending }),
          )
          return null
        },
      })
    })
    utility.maybeExecute()
    update(false)
    dispose()
    expect(customCleanup).not.toHaveBeenCalled()
    expect(providerCleanup).toHaveBeenCalledTimes(mode === 'fallback' ? 1 : 0)
    vi.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
  },
)
