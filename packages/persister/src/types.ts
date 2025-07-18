/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Represents a function that can be called with any arguments and returns any value.
 */
export type AnyFunction = (...args: Array<any>) => any

/**
 * Represents an asynchronous function that can be called with any arguments and returns a promise.
 */
export type AnyAsyncFunction = (...args: Array<any>) => Promise<any>

export type OptionalKeys<T, TKey extends keyof T> = Omit<T, TKey> &
  Partial<Pick<T, TKey>>

export type RequiredKeys<T extends object, K extends keyof T> = Required<
  Pick<T, K>
> &
  Omit<T, K>
