import { shallow } from '@tanstack/store'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/** Registers the utility with its Lit host, including reconnection support. */
export function bindPacer<TState, TSelected, TOptions, TInstance>(
  host: ReactiveControllerHost,
  instance: TInstance & {
    store: {
      state: TState
      subscribe: (listener: () => void) => { unsubscribe: () => void }
    }
    setOptions: (options: TOptions) => void
  },
  options: () => TOptions,
  selector: (state: TState) => TSelected,
  cleanup: () => void,
): TInstance {
  let selected = selector(instance.store.state)
  let subscription: { unsubscribe: () => void } | undefined
  let previousOptions = options()
  const updateOptions = () => {
    const next = options()
    if (shallow(next, previousOptions)) return
    previousOptions = next
    instance.setOptions(next)
  }
  const controller: ReactiveController = {
    hostConnected() {
      if (subscription) return
      updateOptions()
      selected = selector(instance.store.state)
      subscription = instance.store.subscribe(() => {
        const next = selector(instance.store.state)
        if (shallow(next, selected)) return
        selected = next
        host.requestUpdate()
      })
      host.requestUpdate()
    },
    hostUpdate() {
      if (subscription) updateOptions()
    },
    hostDisconnected() {
      if (!subscription) return
      subscription.unsubscribe()
      subscription = undefined
      cleanup()
    },
  }
  Object.defineProperty(instance, 'state', {
    get: () => selected,
    enumerable: true,
  })
  host.addController(controller)
  return instance
}
