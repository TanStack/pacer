import { LitElement, html } from 'lit'
import { expect, it, vi } from 'vitest'
import { createDebouncer, providePacerOptions } from '../src'
import { setup, source, flush } from './setup'
it('updates host defaults and reconnects without replacing the utility', async () => {
  const wait = source(false),
    cleanup = vi.fn()
  const {
    result: utility,
    host,
    destroy,
  } = setup((owner) => {
    providePacerOptions(owner, () => ({ debouncer: { enabled: wait.get() } }))
    return createDebouncer(
      owner,
      () => {},
      { wait: 100, onUnmount: cleanup },
      (state) => state.executionCount,
    )
  })
  await flush()
  expect(utility.options.enabled).toBe(false)
  wait.set(true)
  await flush()
  expect(utility.options.enabled).toBe(true)
  host.remove()
  expect(cleanup).toHaveBeenCalledTimes(1)
  document.body.append(host)
  await flush()
  utility.store.setState((state) => ({ ...state, executionCount: 5 }))
  await flush()
  expect(utility.state).toBe(5)
  destroy()
  expect(cleanup).toHaveBeenCalledTimes(2)
})

it('inherits reactive defaults across shadow roots and reconnects to the nearest provider', async () => {
  class Consumer extends LitElement {
    utility = createDebouncer(this, () => {}, { wait: 100 })
    local = createDebouncer(this, () => {}, { wait: 100, enabled: true })
    override render() {
      return html`<span>consumer</span>`
    }
  }
  class Provider extends LitElement {
    static properties = { enabled: { state: true } }
    declare enabled: boolean
    constructor() {
      super()
      this.enabled = false
      providePacerOptions(this, () => ({
        debouncer: { enabled: this.enabled, leading: true },
      }))
    }
    override render() {
      return html`<pacer-defaults-consumer></pacer-defaults-consumer>`
    }
  }
  customElements.define('pacer-defaults-consumer', Consumer)
  customElements.define('pacer-defaults-provider', Provider)
  const first = new Provider()
  const second = new Provider()
  second.enabled = true
  document.body.append(first, second)
  await first.updateComplete
  await second.updateComplete
  const child = first.shadowRoot!.querySelector(
    'pacer-defaults-consumer',
  ) as Consumer
  await child.updateComplete
  expect(child.utility.options.enabled).toBe(false)
  expect(child.utility.options.leading).toBe(true)
  expect(child.local.options.enabled).toBe(true)
  const instance = child.utility
  first.enabled = true
  await first.updateComplete
  await child.updateComplete
  expect(child.utility.options.enabled).toBe(true)
  first.enabled = false
  await first.updateComplete
  await child.updateComplete
  expect(child.utility.options.enabled).toBe(false)
  second.shadowRoot!.append(child)
  await child.updateComplete
  expect(child.utility).toBe(instance)
  expect(child.utility.options.enabled).toBe(true)
  first.remove()
  second.remove()
})
