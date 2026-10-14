/** Excludes callable data from protocols that interpret functions as accessors. */
export type NonCallable<T> = T extends (...args: Array<never>) => unknown
  ? never
  : T

/** Editable signal utilities process literal non-callable values or updaters. */
export type SignalWrite<T> =
  | Exclude<NonCallable<T>, abstract new (...args: Array<never>) => unknown>
  | ((previous: T) => T)

/** Preserves callable selector results while making other selected values readonly. */
export type ReadonlySelected<T> = T extends (...args: Array<never>) => unknown
  ? T
  : Readonly<T>
