import { injectExternalStore } from './injectExternalStore'
import type { ReadonlySelected } from './readonlySelected'
import type { Readable } from '@tanstack/store'
import type { Signal, ValueEqualityFn } from '@angular/core'

export function injectSelector<TState>(
  source: () => Readable<TState>,
  selector?: undefined,
  options?: { compare?: ValueEqualityFn<{}> },
): Signal<{}>
export function injectSelector<TState, TSelected>(
  source: () => Readable<TState>,
  selector: (state: NoInfer<TState>) => TSelected,
  options?: { compare?: ValueEqualityFn<TSelected> },
): Signal<ReadonlySelected<TSelected>>
export function injectSelector<TState, TSelected>(
  source: () => Readable<TState>,
  selector: (state: NoInfer<TState>) => TSelected | {} = () => ({}),
  options?: { compare?: ValueEqualityFn<TSelected | {}> },
) {
  return injectExternalStore(
    () => {
      const store = source()
      return {
        getSnapshot: () => selector(store.get()),
        subscribe: (notify) => {
          const subscription = store.subscribe(notify)
          return () => subscription.unsubscribe()
        },
      }
    },
    { equal: options?.compare },
  ) as Signal<ReadonlySelected<TSelected | {}>>
}
