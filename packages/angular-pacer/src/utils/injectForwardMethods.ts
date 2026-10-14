import { untracked } from '@angular/core'
import { injectOutsideZone } from './zoneCompatibility'

export type MethodKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: Array<never>) => unknown ? K : never
}[keyof T]

/** Every callable core member must be explicitly forwarded or excluded. */
export type MethodMap<T> = Record<MethodKeys<T>, boolean>

type IncludedMethodKeys<T> = {
  [K in keyof T]-?: T[K] extends true ? K : never
}[keyof T]

export function methodNames<const T extends Record<string, boolean>>(
  methods: T,
): Array<IncludedMethodKeys<T>> {
  return Object.keys(methods).filter((key) => methods[key]) as Array<
    IncludedMethodKeys<T>
  >
}

export function injectForwardMethods<
  TSource,
  TMethods extends MethodKeys<TSource>,
>(
  /* Source of the methods */
  source: () => TSource,
  /* Methods key to register */
  methods: ReadonlyArray<TMethods>,
  /* Callback to run before the method. Runs untracked and outside Angular. */
  before: (instance: TSource, method: TMethods) => void,
): Pick<TSource, TMethods> {
  const runOutside = injectOutsideZone()
  const result = {} as Pick<TSource, TMethods>

  for (const key of methods) {
    result[key] = ((...args: Array<unknown>) =>
      runOutside(() =>
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
