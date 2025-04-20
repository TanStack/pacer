import type { AnyFunction } from '@tanstack/pacer/types'

export function bindInstanceMethods<T extends object>(instance: T) {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
    .filter((key) => typeof instance[key as keyof T] === 'function')
    .reduce(
      (acc, key) => {
        const method = instance[key as keyof T]
        if (typeof method === 'function') {
          acc[key] = method.bind(instance)
        }
        return acc
      },
      {} as Record<string, AnyFunction>,
    )
}
