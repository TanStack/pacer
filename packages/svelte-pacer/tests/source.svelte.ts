export function source<T>(initial: T) {
  let value = $state.raw(initial)
  return {
    get: () => value,
    set: (next: T) => {
      value = next
    },
  }
}
