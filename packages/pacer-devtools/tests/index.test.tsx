import { render } from 'solid-js/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Debouncer } from '@tanstack/pacer'
import { subscribeToPacerDevtoolsInstances } from '@tanstack/pacer/event-client'
import {
  PacerContextProvider,
  usePacerDevtoolsState,
} from '../src/PacerContextProvider'

afterEach(() => {
  vi.useRealTimers()
})

describe('PacerContextProvider', () => {
  it('discovers existing utilities and receives updates after the event client gives up connecting', () => {
    vi.useFakeTimers()

    const connect = vi.fn()
    window.addEventListener('tanstack-connect', connect)

    const existingKey = 'created-before-devtools'
    const existingDebouncer = new Debouncer((_value: string) => {}, {
      key: existingKey,
      wait: 100,
    })

    vi.advanceTimersByTime(5_000)
    expect(connect).toHaveBeenCalledTimes(5)

    let state: ReturnType<typeof usePacerDevtoolsState> | undefined
    const StateObserver = () => {
      state = usePacerDevtoolsState()
      return null
    }
    const dispose = render(
      () => (
        <PacerContextProvider>
          <StateObserver />
        </PacerContextProvider>
      ),
      document.createElement('div'),
    )

    expect(state?.debouncers).toContain(existingDebouncer)

    const initialUpdatedAt = state?.lastUpdatedByKey[existingKey]
    vi.advanceTimersByTime(1)
    existingDebouncer.maybeExecute('updated after mount')

    expect(state?.lastUpdatedByKey[existingKey]).toBeGreaterThan(
      initialUpdatedAt!,
    )
    expect(connect).toHaveBeenCalledTimes(5)

    const updatedAtBeforeBusEvent = state?.lastUpdatedByKey[existingKey]
    vi.advanceTimersByTime(1)
    window.dispatchEvent(
      new CustomEvent('pacer:Debouncer', {
        detail: {
          type: 'pacer:Debouncer',
          pluginId: 'pacer',
          payload: {
            key: existingKey,
            options: existingDebouncer.options,
            store: { state: existingDebouncer.store.state },
          },
        },
      }),
    )

    expect(state?.lastUpdatedByKey[existingKey]).toBeGreaterThan(
      updatedAtBeforeBusEvent!,
    )

    const cleanupThrowingObserver = subscribeToPacerDevtoolsInstances(() => {
      throw new Error('observer failed')
    })
    expect(() =>
      existingDebouncer.maybeExecute('observer failure is isolated'),
    ).not.toThrow()
    cleanupThrowingObserver()

    const laterKey = 'created-after-devtools'
    const laterDebouncer = new Debouncer((_value: string) => {}, {
      key: laterKey,
      wait: 100,
    })

    expect(state?.debouncers).toContain(laterDebouncer)
    expect(state?.lastUpdatedByKey[laterKey]).toBeDefined()
    expect(connect).toHaveBeenCalledTimes(5)

    const updatedAtBeforeDispose = state?.lastUpdatedByKey[existingKey]
    dispose()
    vi.advanceTimersByTime(1)
    existingDebouncer.maybeExecute('updated after dispose')

    expect(state?.lastUpdatedByKey[existingKey]).toBe(updatedAtBeforeDispose)

    window.removeEventListener('tanstack-connect', connect)
  })
})
