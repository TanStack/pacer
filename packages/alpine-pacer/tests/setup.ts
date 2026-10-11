import Alpine from 'alpinejs'
import { vi } from 'vitest'
import { createScope } from '../src/provider/PacerProvider'
import type { PacerScope } from '../src/provider/PacerProvider'
export function setup<T>(create: (owner: PacerScope) => T) {
  const scope = createScope()
  const result = create(scope)
  return { result, destroy: () => scope.destroy() }
}
export function source<T>(initial: T) {
  const value = Alpine.reactive({ current: initial })
  return {
    get: () => value.current,
    set: (next: T) => {
      value.current = next
    },
  }
}
export async function flush() {
  await Promise.resolve()
  vi.runAllTicks()
}
