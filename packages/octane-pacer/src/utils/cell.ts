export type SetValue<T> = (value: T | ((previous: T) => T)) => void
