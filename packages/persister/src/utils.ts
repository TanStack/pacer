import type { AnyFunction } from './types'

export function isFunction<T extends AnyFunction>(value: any): value is T {
  return typeof value === 'function'
}

export function parseFunctionOrValue<T, TArgs extends Array<any>>(
  value: T | ((...args: TArgs) => T),
  ...args: TArgs
): T {
  return isFunction(value) ? value(...args) : value
}

export function bindInstanceMethods<T extends Record<string, any>>(
  instance: T,
): T {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).reduce(
    (acc: any, key) => {
      const method = instance[key as keyof T]
      if (isFunction(method)) {
        acc[key] = method.bind(instance)
      }
      return acc
    },
    instance,
  )
}
