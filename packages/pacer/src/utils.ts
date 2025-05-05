export function bindInstanceMethods<T extends Record<string, any>>(
  instance: T,
): T {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
    .filter((key) => typeof instance[key as keyof T] === 'function')
    .reduce((acc: any, key) => {
      const method = instance[key as keyof T]
      if (typeof method === 'function') {
        acc[key] = method.bind(instance)
      }
      return acc
    }, {} as T)
}
