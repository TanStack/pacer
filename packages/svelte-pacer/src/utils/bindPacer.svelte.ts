import { onDestroy, untrack } from 'svelte'
import { createSubscribe } from './createSubscribe'
import { select } from './select.svelte'
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
  const selected = select(instance.store, selector)
  $effect.pre(() => {
    const latest = options()
    untrack(() => instance.setOptions(latest))
  })
  Object.defineProperty(instance, 'state', {
    get: () => selected.current,
    enumerable: true,
  })
  Object.defineProperty(instance, 'Subscribe', {
    value: createSubscribe(instance.store),
    enumerable: true,
  })
  onDestroy(() => {
    cleanup()
  })
  return instance
}
