import { render } from 'solid-js/web'
import { expect, it, vi } from 'vitest'
import { Debouncer } from '@tanstack/pacer'
import {
  PacerContextProvider,
  usePacerDevtoolsState,
} from '../src/PacerContextProvider'

vi.mock('@tanstack/pacer/event-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/pacer/event-client')>()
  const legacy: Partial<typeof actual> = { ...actual }
  delete legacy.subscribeToPacerDevtoolsInstances
  return legacy
})

it('keeps bus events working with a core module that has no subscription export', () => {
  const instance = new Debouncer(() => {}, { key: 'legacy-core', wait: 100 })
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
  try {
    expect(state.debouncers).toEqual([])
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
  } finally {
    dispose()
  }
})
