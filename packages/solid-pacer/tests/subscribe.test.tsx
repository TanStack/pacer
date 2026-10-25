import { createRoot, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import {
  createAsyncBatcher,
  createAsyncDebouncer,
  createAsyncQueuer,
  createAsyncRateLimiter,
  createAsyncThrottler,
  createBatcher,
  createDebouncer,
  createQueuer,
  createRateLimiter,
  createThrottler,
} from '../src'
import type { JSX } from 'solid-js'

type SubscribeUtility = {
  Subscribe: (props: {
    selector: (state: any) => unknown
    children: JSX.Element | ((state: () => unknown) => JSX.Element)
  }) => JSX.Element
}

const utilities: Array<[string, () => SubscribeUtility]> = [
  ['createAsyncBatcher', () => createAsyncBatcher(() => Promise.resolve())],
  [
    'createAsyncDebouncer',
    () => createAsyncDebouncer(() => Promise.resolve(), { wait: 100 }),
  ],
  ['createAsyncQueuer', () => createAsyncQueuer(() => Promise.resolve())],
  [
    'createAsyncRateLimiter',
    () =>
      createAsyncRateLimiter(() => Promise.resolve(), {
        limit: 1,
        window: 100,
      }),
  ],
  [
    'createAsyncThrottler',
    () => createAsyncThrottler(() => Promise.resolve(), { wait: 100 }),
  ],
  ['createBatcher', () => createBatcher(() => {})],
  ['createDebouncer', () => createDebouncer(() => {}, { wait: 100 })],
  ['createQueuer', () => createQueuer(() => {})],
  [
    'createRateLimiter',
    () => createRateLimiter(() => {}, { limit: 1, window: 100 }),
  ],
  ['createThrottler', () => createThrottler(() => {}, { wait: 100 })],
]

describe('Subscribe', () => {
  it.each(utilities)(
    '%s should update non-function children when they change',
    (_name, createUtility) => {
      const container = document.createElement('div')
      const [isOn, setIsOn] = createSignal(true)

      const dispose = createRoot((dispose) => {
        const utility = createUtility()
        render(
          () => (
            <utility.Subscribe selector={(state) => state}>
              {isOn() ? <b>on</b> : <i>off</i>}
            </utility.Subscribe>
          ),
          container,
        )
        return dispose
      })

      expect(container.innerHTML).toBe('<b>on</b>')

      setIsOn(false)

      expect(container.innerHTML).toBe('<i>off</i>')

      dispose()
    },
  )

  it('should use the latest selector when the state changes', () => {
    const container = document.createElement('div')
    const [selector, setSelector] = createSignal(
      (state: { maybeExecuteCount: number }) => `a:${state.maybeExecuteCount}`,
    )

    const { debouncer, dispose } = createRoot((dispose) => {
      const debouncer = createDebouncer(() => {}, { wait: 100 })
      render(
        () => (
          <debouncer.Subscribe selector={selector()}>
            {(selected) => <span>{selected()}</span>}
          </debouncer.Subscribe>
        ),
        container,
      )
      return { debouncer, dispose }
    })

    expect(container.textContent).toBe('a:0')

    setSelector(
      () => (state: { maybeExecuteCount: number }) =>
        `b:${state.maybeExecuteCount}`,
    )
    debouncer.maybeExecute()

    expect(container.textContent).toBe('b:1')

    dispose()
  })
})
