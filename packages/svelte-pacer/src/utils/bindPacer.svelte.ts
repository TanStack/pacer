import { shallow, useSelector } from '@tanstack/svelte-store'
import { onDestroy, untrack } from 'svelte'
import type { ReadonlyStore } from '@tanstack/svelte-store'

/** Connects a core utility to the current Svelte component. */
export function bindPacer<TState, TSelected, TOptions, TInstance>(
  instance: TInstance & {
    store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>
    setOptions: (options: TOptions) => void
  },
  options: () => TOptions,
  selector: (state: TState) => TSelected,
  cleanup: () => void,
): TInstance {
  const selected = useSelector(instance.store, selector, { compare: shallow })
  $effect.pre(() => {
    const latest = options()
    untrack(() => instance.setOptions(latest))
  })
  Object.defineProperty(instance, 'state', {
    get: () => selected.current,
    enumerable: true,
  })
  onDestroy(() => {
    cleanup()
  })
  return instance
}
