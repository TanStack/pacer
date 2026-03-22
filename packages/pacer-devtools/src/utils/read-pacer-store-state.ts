/** TanStack Store (`@tanstack/store`) used by pacer utils. */
export function isPacerUtilTanStackStore(x: unknown): x is {
  subscribe: (cb: (s: unknown) => void) => { unsubscribe: () => void }
  get: () => unknown
} {
  return (
    typeof x === 'object' &&
    x !== null &&
    'subscribe' in x &&
    typeof (x as { subscribe: unknown }).subscribe === 'function' &&
    'get' in x &&
    typeof (x as { get: unknown }).get === 'function'
  )
}

/**
 * Core pacer utils expose TanStack `Store` (`get()` / `state`). React hooks may
 * also expose a reactive `state` field. Use this for devtools UI that needs a
 * plain snapshot (e.g. JsonTree).
 */
export function getPacerUtilStoreState(instance: {
  store?: { get?: () => unknown; state?: unknown }
  state?: unknown
}): unknown {
  const store = instance.store
  if (store && typeof store.get === 'function') {
    return store.get()
  }
  if (store && store.state !== undefined) {
    return store.state
  }
  return instance.state
}
