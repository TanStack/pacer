/**
 * Represents a function that can be called with any arguments and returns any value.
 * @template TArgs - The type of the arguments the function can be called with.
 * @returns The return value of the function.
 */
export type AnyFunction<TArgs extends Array<any> = Array<any>> = (
  ...args: TArgs
) => any

/**
 * Represents an asynchronous function that can be called with any arguments and returns a promise.
 * @template TArgs - The type of the arguments the function can be called with.
 * @returns A promise that resolves to the return value of the function.
 */
export type AnyAsyncFunction<TArgs extends Array<any> = Array<any>> = (
  ...args: TArgs
) => Promise<any>
