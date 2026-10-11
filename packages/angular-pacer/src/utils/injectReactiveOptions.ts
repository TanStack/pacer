import {
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  untracked,
} from '@angular/core'
import type { PacerProviderOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'

function hasEnumerableGetter(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  return Reflect.ownKeys(value).some((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor?.enumerable && typeof descriptor.get === 'function'
  })
}

function getPropertyDescriptor(
  value: object,
  key: PropertyKey,
): PropertyDescriptor | undefined {
  let current: object | null = value
  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key)
    if (descriptor) return descriptor
    current = Object.getPrototypeOf(current) as object | null
  }
  return undefined
}

/** Track shallow options snapshots and defer getter reads until inputs are bound. */
export function injectReactiveOptions<
  TOptions extends object,
  TInstance extends { setOptions: (options: Partial<TOptions>) => void },
>(
  options: AngularPacerOptions<TOptions>,
  defaults: PacerProviderOptions,
  kind: keyof PacerProviderOptions,
  create: (options: TOptions, getPublicInstance: () => TInstance) => TInstance,
): TInstance {
  const defaultDescriptor = getPropertyDescriptor(defaults, kind)
  const reactive =
    typeof options === 'function' ||
    hasEnumerableGetter(options) ||
    typeof defaultDescriptor?.get === 'function' ||
    hasEnumerableGetter(defaultDescriptor?.value)
  const readOptions = (): TOptions =>
    ({
      ...defaults[kind],
      ...(typeof options === 'function' ? options() : options),
    }) as TOptions

  if (!reactive) {
    const result: TInstance = untracked(() =>
      create(readOptions(), () => result),
    )
    return result
  }

  const injector = inject(Injector)
  const destroyRef = inject(DestroyRef)
  const currentOptions = computed(readOptions)
  let instance: TInstance | undefined
  let destroyed = false
  destroyRef.onDestroy(() => {
    destroyed = true
  })

  const getInstance = (): TInstance => {
    if (!instance) {
      if (destroyed) {
        throw new Error(
          'Cannot initialize a Pacer utility after its injection context is destroyed.',
        )
      }
      instance = untracked(() =>
        runInInjectionContext(injector, () =>
          create(currentOptions(), () => result),
        ),
      )
    }
    return instance
  }

  const result = new Proxy({} as TInstance, {
    get: (_target, property) => Reflect.get(getInstance(), property),
    set: (_target, property, value) =>
      Reflect.set(getInstance(), property, value),
    has: (_target, property) => Reflect.has(getInstance(), property),
    ownKeys: () => Reflect.ownKeys(getInstance()),
    getOwnPropertyDescriptor: (_target, property) =>
      Reflect.getOwnPropertyDescriptor(getInstance(), property),
  })

  effect(() => {
    const latest = currentOptions()
    untracked(() => {
      if (instance) {
        instance.setOptions(latest)
      } else {
        getInstance()
      }
    })
  })
  return result
}
