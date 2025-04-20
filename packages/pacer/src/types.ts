export type AnyFunction<TArgs extends Array<any> = Array<any>> = (
  ...args: TArgs
) => any

export type AnyAsyncFunction<TArgs extends Array<any> = Array<any>> = (
  ...args: TArgs
) => Promise<any>
