import { createPacerScope } from './provider/createPacerScope'
import type Alpine from 'alpinejs'
import type { createPacerScope as ScopeFactory } from './provider/createPacerScope'

/** Installs $pacer, whose registrations and subscriptions belong to its element. */
export function pacerPlugin(alpine: typeof Alpine): void {
  const scopes = new WeakMap<Element, ReturnType<typeof ScopeFactory>>()
  alpine.magic('pacer', (element, { cleanup }) => {
    let scope = scopes.get(element)
    if (!scope) {
      scope = createPacerScope()
      scopes.set(element, scope)
      const ownedScope = scope
      cleanup(() => {
        ownedScope.destroy()
        scopes.delete(element)
      })
    }
    return scope
  })
}
