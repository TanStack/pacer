import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import type { App, Component } from 'vue'
import {
  PacerDevtoolsPanel,
  PacerDevtoolsPanelNoOp,
} from '../src/VuePacerDevtools'
const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/pacer-devtools/production', () => ({
  PacerDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))
let app: App | undefined
let target: HTMLDivElement
beforeEach(() => {
  vi.clearAllMocks()
  target = document.createElement('div')
  document.body.append(target)
})
afterEach(() => {
  app?.unmount()
  app = undefined
  target.remove()
  vi.unstubAllEnvs()
})
function render(component: Component, props = {}) {
  app = createApp({ render: () => h(component, props) })
  app.mount(target)
}
it('mounts standalone defaults and releases the panel', () => {
  render(PacerDevtoolsPanel)
  expect(core.mount).toHaveBeenCalledExactlyOnceWith(target.firstElementChild, {
    theme: 'dark',
    devtoolsOpen: true,
  })
  app!.unmount()
  app = undefined
  expect(core.unmount).toHaveBeenCalledOnce()
})
it('applies changed dock props', async () => {
  const props = reactive({ theme: 'dark', devtoolsOpen: true })
  render(PacerDevtoolsPanel, props)
  props.theme = 'light'
  props.devtoolsOpen = false
  await nextTick()
  expect(core.unmount).toHaveBeenCalledOnce()
  expect(core.mount).toHaveBeenLastCalledWith(target.firstElementChild, {
    theme: 'light',
    devtoolsOpen: false,
  })
})
it('keeps no-op panels inert', () => {
  render(PacerDevtoolsPanelNoOp)
  expect(core.mount).not.toHaveBeenCalled()
})
it.each(['development', 'production'])(
  'selects the root exports in %s',
  async (mode) => {
    vi.stubEnv('NODE_ENV', mode)
    vi.resetModules()
    const entry = await import('../src')
    render(entry.PacerDevtoolsPanel)
    expect(core.mount).toHaveBeenCalledTimes(mode === 'development' ? 1 : 0)
  },
)
it('keeps the explicit production panel functional', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.resetModules()
  const entry = await import('../src/production')
  render(entry.PacerDevtoolsPanel)
  expect(core.mount).toHaveBeenCalledOnce()
  expect(entry.pacerDevtoolsPlugin({}).component).toBe(entry.PacerDevtoolsPanel)
})
