/**
 * Represents a function that can be called with any arguments and returns any value.
 */
export type AnyFunction = (...args: Array<any>) => any

/**
 * Represents an asynchronous function that can be called with any arguments and returns a promise.
 */
export type AnyAsyncFunction = (...args: Array<any>) => Promise<any>
