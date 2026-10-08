/** Preserves callable selector results while making other selected values readonly. */
export type ReadonlySelected<T> = T extends (...args: Array<never>) => unknown
  ? T
  : Readonly<T>
