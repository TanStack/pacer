import { shallow } from '@tanstack/svelte-store'
import { onDestroy, untrack } from 'svelte'
import type { ReadonlyStore } from '@tanstack/svelte-store'

/** Tracks store updates and reactive inputs read by the selector. */
export function select<TState, TSelected>(
  store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
) {
  let selected = $state.raw(untrack(() => selector(store.get())))
  let revision = $state(0)
  const update = (next: TSelected) => {
    if (!shallow(selected, next)) selected = next
  }
  $effect.pre(() => {
    // Re-track conditional reactive inputs even when the selection stays equal.
    void revision
    const next = selector(store.get())
    untrack(() => update(next))
  })
  const subscription = store.subscribe((state) =>
    untrack(() => {
      revision++
      update(selector(state))
    }),
  )
  onDestroy(() => subscription.unsubscribe())
  return {
    get current() {
      return selected
    },
  }
}
