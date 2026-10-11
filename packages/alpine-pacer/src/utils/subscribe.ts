import Alpine from 'alpinejs'
import { shallow } from '@tanstack/store'
import type { ReadonlyStore } from '@tanstack/store'
import type { PacerScope } from '../provider/PacerProvider'

/** Selects state for a child scope without changing the utility owner's selection. */
export type AlpinePacerSubscribe<TState> = <TSelected>(
  scope: PacerScope,
  selector: (state: TState) => TSelected,
) => () => TSelected

export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'state' | 'subscribe'>,
): AlpinePacerSubscribe<TState> {
  return (scope, selector) => {
    scope.assertActive()
    let selected = selector(store.state)
    const state = Alpine.reactive({ value: selected })
    const changes = Alpine.reactive({ revision: 0 })
    const update = () => {
      const next = selector(store.state)
      if (shallow(selected, next)) return
      selected = next
      state.value = next
    }
    scope.effect(() => {
      // Store changes can switch which reactive inputs the selector reads.
      void changes.revision
      update()
    })
    const subscription = store.subscribe(() => {
      changes.revision = Alpine.raw(changes).revision + 1
      update()
    })
    scope.addCleanup(() => subscription.unsubscribe())
    return () => state.value
  }
}
