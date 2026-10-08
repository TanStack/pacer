import { untracked } from '@angular/core'
import { injectOutsideZone } from './injectOutsideZone'
import type { Signal } from '@angular/core'

export type MethodKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: Array<never>) => unknown ? K : never
}[keyof T]

export function injectForwardMethods<
  TSource,
  TMethods extends MethodKeys<TSource>,
>(
  /* Source of the methods */
  source: Signal<TSource>,
  /* Methods key to register */
  methods: ReadonlyArray<TMethods>,
  /* Callback to run before the method. Runs untracked and outside Angular. */
  before: (instance: TSource, method: TMethods) => void,
): Pick<TSource, TMethods> {
  const outsideZone = injectOutsideZone()
  const result = {} as Pick<TSource, TMethods>

  for (const key of methods) {
    result[key] = ((...args: Array<unknown>) =>
      outsideZone(() =>
        untracked(() => {
          const instance = source()
          before(instance, key)

          const method = instance[key] as (...args: Array<unknown>) => unknown
          return method.apply(instance, args)
        }),
      )) as TSource[TMethods]
  }

  return result
}
