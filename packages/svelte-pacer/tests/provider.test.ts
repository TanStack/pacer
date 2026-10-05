import { expect, it } from 'vitest'
import { mount, unmount, flushSync } from 'svelte'
import { createDebouncer } from '../src'
import type { SvelteDebouncer } from '../src'
import { source } from './source.svelte'
import ProviderHost from './ProviderHost.svelte'
it('tracks provider defaults and preserves local overrides', async () => {
  const enabled = source(false)
  let inherited!: SvelteDebouncer<() => void>
  let local!: SvelteDebouncer<() => void>
  const target = document.createElement('div')
  document.body.append(target)
  const component = mount(ProviderHost, {
    target,
    props: {
      defaults: () => ({ debouncer: { enabled: enabled.get() } }),
      setup: () => {
        inherited = createDebouncer(() => {}, { wait: 100 })
        local = createDebouncer(() => {}, { wait: 100, enabled: false })
      },
    },
  })
  flushSync()
  const original = inherited
  expect(inherited.options.enabled).toBe(false)
  enabled.set(true)
  flushSync()
  expect(inherited).toBe(original)
  expect(inherited.options.enabled).toBe(true)
  expect(local.options.enabled).toBe(false)
  await unmount(component)
  target.remove()
})
