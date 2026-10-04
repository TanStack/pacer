import { shallow, useSelector } from '@tanstack/vue-store'
import { getCurrentScope, onScopeDispose, watch } from 'vue'
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
  const selected = useSelector(instance.store, selector, { compare: shallow })
  // A watch callback does not track reads performed inside the core utility.
  const stop = watch(options, (value) => instance.setOptions(value), {
    flush: 'sync',
  })
  Object.defineProperty(instance, 'state', {
    value: selected,
    enumerable: true,
  })
  onScopeDispose(() => {
    stop()
    cleanup()
  })
  return instance
}
