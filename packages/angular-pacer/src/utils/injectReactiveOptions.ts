import {
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  untracked,
} from '@angular/core'

/** Defer factory options until inputs are available without replacing the utility. */
export function injectReactiveOptions<
  TOptions extends { onUnmount?: (instance: TInstance) => void },
  TInstance extends { setOptions: (options: Partial<TOptions>) => void },
>(
  options: () => TOptions,
  create: (options: TOptions) => TInstance,
): TInstance {
  const injector = inject(Injector)
  const destroyRef = inject(DestroyRef)
  const currentOptions = computed(options)
  let instance: TInstance | undefined
  let destroyed = false
  destroyRef.onDestroy(() => {
    destroyed = true
  })

  const resolveOptions = (): TOptions => {
    const latest = currentOptions()
    return {
      ...latest,
      onUnmount: latest.onUnmount ? () => latest.onUnmount!(result) : undefined,
    }
  }
  const getInstance = (): TInstance => {
    if (!instance) {
      if (destroyed) {
        throw new Error(
          'Cannot initialize a Pacer utility after its injection context is destroyed.',
        )
      }
      instance = untracked(() =>
        runInInjectionContext(injector, () => create(resolveOptions())),
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
    const latest = resolveOptions()
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
