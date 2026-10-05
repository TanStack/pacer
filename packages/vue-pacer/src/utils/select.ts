import { shallow } from '@tanstack/vue-store'
import { onScopeDispose, shallowReadonly, shallowRef, watch } from 'vue'
import type { ReadonlyStore } from '@tanstack/vue-store'
import type { ShallowRef } from 'vue'

/** Tracks store updates and reactive inputs read by the selector. */
export function select<TState, TSelected>(
  store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): Readonly<ShallowRef<TSelected>> {
  const selected = shallowRef(selector(store.get()))
  const revision = shallowRef(0)
  const update = (next: TSelected) => {
    if (!shallow(selected.value, next)) selected.value = next
  }
  watch(
    () => {
      // Store changes can switch which reactive inputs the selector reads.
      void revision.value
      return selector(store.get())
    },
    update,
    { flush: 'sync' },
  )
  const subscription = store.subscribe(() => {
    revision.value++
  })
  onScopeDispose(() => subscription.unsubscribe())
  return shallowReadonly(selected)
}
