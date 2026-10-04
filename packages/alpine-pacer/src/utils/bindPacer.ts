import { createSubscribe } from './subscribe'
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
  const selected = createSubscribe(instance.store)(scope, selector)
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
  Object.defineProperty(instance, 'subscribe', {
    value: createSubscribe(instance.store),
    enumerable: true,
  })
  Object.defineProperty(instance, 'state', {
    get: selected,
    enumerable: true,
  })
  scope.addCleanup(cleanup)
  return instance
}
