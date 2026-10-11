/** Assigns a value or derives it from the last committed value. */
export type SetValue<TValue> = (
  value: TValue | ((previous: TValue) => TValue),
) => void
