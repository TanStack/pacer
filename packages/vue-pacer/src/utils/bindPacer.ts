import { getCurrentScope, onScopeDispose, watch } from 'vue'
import { createSubscribe } from './Subscribe'
import { select } from './select'
import type { ReadonlyStore } from '@tanstack/vue-store'

/** Connects a core utility to the current Vue effect scope. */
export function bindPacer<TState, TSelected, TOptions, TInstance>(
  instance: TInstance & {
    store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>
    setOptions: (options: TOptions) => void
  },
  options: () => TOptions,
  selector: (state: TState) => TSelected,
  cleanup: () => void,
): TInstance {
  if (!getCurrentScope())
    throw new Error('Pacer composables require an active Vue effect scope')
  const selected = select(instance.store, selector)
  // A watch callback does not track reads performed inside the core utility.
  const stop = watch(options, (value) => instance.setOptions(value), {
    flush: 'sync',
  })
  Object.defineProperty(instance, 'state', {
    value: selected,
    enumerable: true,
  })
  Object.defineProperty(instance, 'Subscribe', {
    value: createSubscribe(instance.store),
    enumerable: true,
  })
  onScopeDispose(() => {
    stop()
    cleanup()
  })
  return instance
}
