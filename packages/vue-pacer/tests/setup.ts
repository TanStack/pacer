import { effectScope, ref } from 'vue'
export function setup<T>(create: () => T) {
  const scope = effectScope()
  const result = scope.run(create)!
  return { result, destroy: () => scope.stop() }
}
export function source<T>(initial: T) {
  const value = ref(initial)
  return {
    get: () => value.value as T,
    set: (next: T) => {
      value.value = next
    },
  }
}
export function flush() {}
