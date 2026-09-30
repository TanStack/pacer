import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  emitChange,
  getPacerDevtoolsInstance,
  pacerEventClient,
  registerPacerDevtoolsInstance,
  subscribeToPacerDevtoolsInstances,
} from '../src/event-client'

const cleanups: Array<() => void> = []
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  vi.restoreAllMocks()
})

function instance(key: string) {
  return {
    key,
    options: { wait: 100 },
    store: { state: { executionCount: 0 } },
  }
}

describe('devtools instance subscriptions', () => {
  it('replays existing keyed instances and emits live changes once per change', () => {
    const existing = instance('registry-replay')
    emitChange('Debouncer', existing)
    const observer = vi.fn()
    cleanups.push(
      subscribeToPacerDevtoolsInstances((registration) => {
        if (registration.key === existing.key) observer(registration)
      }),
    )
    expect(observer).toHaveBeenCalledExactlyOnceWith({
      event: 'Debouncer',
      key: existing.key,
      instance: existing,
    })
    existing.store.state.executionCount++
    emitChange('Debouncer', existing)
    expect(observer).toHaveBeenCalledTimes(2)
    expect(getPacerDevtoolsInstance(existing.key)).toBe(existing)
  })

  it('isolates replay and update observer exceptions from other observers and application work', () => {
    const existing = instance('registry-exceptions')
    emitChange('Debouncer', existing)
    const bad = vi.fn(() => {
      throw new Error('observer failed')
    })
    expect(() => {
      cleanups.push(subscribeToPacerDevtoolsInstances(bad))
    }).not.toThrow()
    const good = vi.fn()
    cleanups.push(
      subscribeToPacerDevtoolsInstances((registration) => {
        if (registration.key === existing.key) good(registration)
      }),
    )
    expect(() => emitChange('Debouncer', existing)).not.toThrow()
    expect(good).toHaveBeenCalledTimes(2)
    expect(bad).toHaveBeenCalled()
  })

  it('stops notifications after idempotent unsubscribe', () => {
    const existing = instance('registry-unsubscribe')
    const observer = vi.fn()
    const unsubscribe = subscribeToPacerDevtoolsInstances((registration) => {
      if (registration.key === existing.key) observer(registration)
    })
    emitChange('Debouncer', existing)
    unsubscribe()
    unsubscribe()
    emitChange('Debouncer', existing)
    expect(observer).toHaveBeenCalledTimes(1)
  })

  it('replays only the latest instance stored under a replaced key', () => {
    const older = instance('registry-replace')
    const newer = instance('registry-replace')
    emitChange('Debouncer', older)
    emitChange('Debouncer', newer)
    const observer = vi.fn()
    cleanups.push(
      subscribeToPacerDevtoolsInstances((registration) => {
        if (registration.key === newer.key) observer(registration.instance)
      }),
    )
    expect(observer).toHaveBeenCalledExactlyOnceWith(newer)
  })

  it('preserves JSON-safe transport and reads the current Store get API', () => {
    const emit = vi.spyOn(pacerEventClient, 'emit')
    const live = {
      key: 'registry-wire',
      store: { state: 'old', get: () => ({ count: 3 }) },
      options: { wait: 100, onSuccess: () => {} },
    }
    emitChange('Debouncer', live)
    expect(emit).toHaveBeenCalledExactlyOnceWith('Debouncer', {
      key: live.key,
      store: { state: { count: 3 } },
      options: { wait: 100 },
    })
    expect(getPacerDevtoolsInstance(live.key)).toBe(live)
  })

  it('does not register or notify for unkeyed utilities', () => {
    const observer = vi.fn()
    cleanups.push(subscribeToPacerDevtoolsInstances(observer))
    observer.mockClear()
    emitChange('Debouncer', { options: {}, store: { state: {} } })
    expect(observer).not.toHaveBeenCalled()
  })

  it('preserves manually registered instance lookup without inventing an event type', () => {
    const manual = instance('registry-manual')
    registerPacerDevtoolsInstance(manual.key, manual)
    expect(getPacerDevtoolsInstance(manual.key)).toBe(manual)
    const observer = vi.fn()
    cleanups.push(
      subscribeToPacerDevtoolsInstances((registration) => {
        if (registration.key === manual.key) observer(registration)
      }),
    )
    expect(observer).not.toHaveBeenCalled()
    emitChange('Debouncer', manual)
    expect(observer).toHaveBeenCalledTimes(1)
  })
})

it('unsubscribes independent registrations of the same callback separately', () => {
  const live = instance('registry-shared-callback')
  const listener = vi.fn()
  const first = subscribeToPacerDevtoolsInstances(listener)
  const second = subscribeToPacerDevtoolsInstances(listener)
  cleanups.push(first, second)
  listener.mockClear()
  first()
  emitChange('Debouncer', live)
  expect(listener).toHaveBeenCalledTimes(1)
})

it('does not duplicate a replay when an observer subscribes during delivery', () => {
  const live = instance('registry-nested-subscription')
  const nested = vi.fn()
  cleanups.push(
    subscribeToPacerDevtoolsInstances((registration) => {
      if (registration.key === live.key) {
        cleanups.push(
          subscribeToPacerDevtoolsInstances((next) => {
            if (next.key === live.key) nested(next)
          }),
        )
      }
    }),
  )
  emitChange('Debouncer', live)
  expect(nested).toHaveBeenCalledTimes(1)
})
