import { render } from 'solid-js/web'
import { afterEach, expect, it, vi } from 'vitest'
import { Debouncer } from '@tanstack/pacer'
import {
  PacerContextProvider,
  usePacerDevtoolsState,
} from '../src/PacerContextProvider'

const cleanups: Array<() => void> = []
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  vi.useRealTimers()
})

function mountProvider() {
  let state!: ReturnType<typeof usePacerDevtoolsState>
  function Observer() {
    state = usePacerDevtoolsState()
    return null
  }
  const dispose = render(
    () => (
      <PacerContextProvider>
        <Observer />
      </PacerContextProvider>
    ),
    document.createElement('div'),
  )
  cleanups.push(dispose)
  return { state, dispose }
}

it('discovers existing utilities and receives updates after event transport exhausts reconnection', () => {
  vi.useFakeTimers()
  const connect = vi.fn()
  window.addEventListener('tanstack-connect', connect)
  cleanups.push(() => window.removeEventListener('tanstack-connect', connect))
  const instance = new Debouncer(() => {}, { key: 'late-discovery', wait: 100 })
  vi.advanceTimersByTime(5000)
  expect(connect).toHaveBeenCalledTimes(5)
  const { state } = mountProvider()
  expect.soft(state.debouncers).toContain(instance)
  vi.advanceTimersByTime(1)
  instance.maybeExecute()
  expect.soft(state.debouncers).toContain(instance)
  expect.soft(state.lastUpdatedByKey['late-discovery']).toBe(Date.now())
  window.dispatchEvent(
    new CustomEvent('pacer:Debouncer', {
      detail: {
        type: 'pacer:Debouncer',
        pluginId: 'pacer',
        payload: {
          key: instance.key,
          options: instance.options,
          store: { state: instance.store.state },
        },
      },
    }),
  )
  expect(state.debouncers).toContain(instance)
})

it('replaces a utility with the same key without duplicating relayed events', () => {
  const first = new Debouncer(() => {}, { key: 'replacement', wait: 100 })
  const { state } = mountProvider()
  expect(state.debouncers.filter((item) => item.key === 'replacement')).toEqual(
    [first],
  )
  const replacement = new Debouncer(() => {}, { key: 'replacement', wait: 100 })
  window.dispatchEvent(
    new CustomEvent('pacer:Debouncer', {
      detail: {
        type: 'pacer:Debouncer',
        pluginId: 'pacer',
        payload: {
          key: 'replacement',
          options: first.options,
          store: { state: first.store.state },
        },
      },
    }),
  )
  expect(state.debouncers.filter((item) => item.key === 'replacement')).toEqual(
    [replacement],
  )
})

it('keeps disposed panels unchanged when another panel mounts and receives updates', () => {
  vi.useFakeTimers()
  const instance = new Debouncer(() => {}, { key: 'remounted', wait: 100 })
  const first = mountProvider()
  const oldTimestamp = first.state.lastUpdatedByKey.remounted
  first.dispose()
  vi.advanceTimersByTime(1)
  const second = mountProvider()
  vi.advanceTimersByTime(1)
  instance.maybeExecute()
  expect(second.state.debouncers).toContain(instance)
  expect(second.state.lastUpdatedByKey.remounted).toBe(Date.now())
  expect(first.state.lastUpdatedByKey.remounted).toBe(oldTimestamp)
})
