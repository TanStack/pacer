import { shallow } from '@tanstack/store'
import Alpine from 'alpinejs'
import type { PacerScope } from '../provider/PacerProvider'

/** Connects core state and options to an owned Alpine scope. */
export function bindPacer<TState, TSelected, TOptions, TInstance>(
  scope: PacerScope,
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
  scope.assertActive()
  const selected = Alpine.reactive({ value: selector(instance.store.state) })
  const subscription = instance.store.subscribe(() => {
    const next = selector(instance.store.state)
    if (!shallow(next, Alpine.raw(selected.value))) selected.value = next
  })
  // Defer core updates so core callbacks cannot become Alpine effect dependencies.
  let initial = true
  scope.effect(() => {
    const latest = options()
    if (initial) {
      initial = false
      return
    }
    queueMicrotask(() => {
      if (!scope.destroyed) instance.setOptions(latest)
    })
  })
  Object.defineProperty(instance, 'state', {
    get: () => selected.value,
    enumerable: true,
  })
  scope.addCleanup(() => {
    subscription.unsubscribe()
    cleanup()
  })
  return instance
}
