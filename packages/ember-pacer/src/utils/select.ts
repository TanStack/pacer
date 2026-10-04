import { registerDestructor } from '@ember/destroyable'
import { trackedObject } from '@ember/reactive/collections'

export function select<T, TSelected>(
  owner: object,
  store: {
    state: T
    subscribe: (listener: () => void) => { unsubscribe: () => void }
  },
  selector: (value: T) => TSelected,
) {
  const state = trackedObject({ snapshot: store.state })
  const subscription = store.subscribe(() => {
    state.snapshot = store.state
  })
  registerDestructor(owner, () => subscription.unsubscribe())
  return {
    get value() {
      return selector(state.snapshot)
    },
  }
}
