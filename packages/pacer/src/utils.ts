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

export function createKey(key?: string): string {
  if (key) {
    return key
  }

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return ''
}
