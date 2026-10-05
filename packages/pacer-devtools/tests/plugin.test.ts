import { afterEach, expect, it, vi } from 'vitest'
import { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin } from '../src/plugin'

const instances = vi.hoisted(
  () =>
    [] as Array<{
      mount: ReturnType<typeof vi.fn>
      unmount: ReturnType<typeof vi.fn>
    }>,
)
vi.mock('../src/core', () => ({
  PacerDevtoolsCore: class {
    mount = vi.fn()
    unmount = vi.fn()
    constructor() {
      instances.push(this)
    }
  },
}))
afterEach(() => {
  instances.length = 0
  vi.unstubAllEnvs()
})

it('mounts in the host, updates host props, and destroys every owned panel', () => {
  const plugin = pacerDevtoolsPlugin()
  const element = document.createElement('div')
  plugin.render(element, { theme: 'dark', devtoolsOpen: true })
  expect(instances[0]!.mount).toHaveBeenCalledWith(element, {
    theme: 'dark',
    devtoolsOpen: true,
  })
  plugin.render(element, { theme: 'dark', devtoolsOpen: true })
  expect(instances).toHaveLength(1)
  plugin.render(element, { theme: 'light', devtoolsOpen: false })
  expect(instances[0]!.unmount).toHaveBeenCalledOnce()
  expect(instances[1]!.mount).toHaveBeenCalledWith(element, {
    theme: 'light',
    devtoolsOpen: false,
  })
  plugin.destroy()
  plugin.destroy()
  expect(instances[1]!.unmount).toHaveBeenCalledOnce()
})

it('keeps the no-op plugin inert', () => {
  const plugin = pacerDevtoolsNoOpPlugin()
  plugin.render(document.createElement('div'), {
    theme: 'dark',
    devtoolsOpen: true,
  })
  plugin.destroy()
  expect(instances).toHaveLength(0)
})
