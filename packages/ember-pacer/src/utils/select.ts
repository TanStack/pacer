import { registerDestructor } from '@ember/destroyable'
import { trackedObject } from '@ember/reactive/collections'
import { shallow } from '@tanstack/store'

export function select<T, TSelected>(
  owner: object,
  store: {
    state: T
    subscribe: (listener: () => void) => { unsubscribe: () => void }
  },
  selector: (value: T) => TSelected,
) {
  const state = trackedObject({ selected: selector(store.state) })
  const subscription = store.subscribe(() => {
    const next = selector(store.state)
    if (!shallow(state.selected, next)) state.selected = next
  })
  registerDestructor(owner, () => subscription.unsubscribe())
  return {
    get value() {
      // Reading the cached selection tracks only selected store changes. Re-read
      // the selector so updated helper arguments and tracked inputs also apply.
      const selected = state.selected
      const next = selector(store.state)
      return shallow(selected, next) ? selected : next
    },
  }
}
