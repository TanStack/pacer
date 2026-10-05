import { LitElement } from 'lit'
import type { ReactiveControllerHost } from 'lit'
let nextId = 0
const hosts = new Set<LitElement>()
export function setup<T>(create: (owner: ReactiveControllerHost) => T): {
  result: T
  host: LitElement
  destroy: () => void
} {
  let result!: T
  class Host extends LitElement {
    constructor() {
      super()
      result = create(this)
    }
  }
  const name = `pacer-test-${nextId++}`
  customElements.define(name, Host)
  const host = document.createElement(name) as Host
  hosts.add(host)
  document.body.append(host)
  return {
    result,
    host,
    destroy: () => {
      host.remove()
      hosts.delete(host)
    },
  }
}
export function source<T>(initial: T) {
  let value = initial
  return {
    get: () => value,
    set: (next: T) => {
      value = next
      for (const host of hosts) host.requestUpdate()
    },
  }
}
export async function flush() {
  await Promise.all([...hosts].map((host) => host.updateComplete))
}
