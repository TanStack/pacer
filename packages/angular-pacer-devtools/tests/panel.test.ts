import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  PacerDevtoolsPanel,
  PacerDevtoolsPanelNoOp,
} from '../src/AngularPacerDevtools'
import { pacerDevtoolsNoOpPlugin, pacerDevtoolsPlugin } from '../src/plugin'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/pacer-devtools/production', () => ({
  PacerDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

let host: HTMLDivElement
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  host.remove()
  vi.unstubAllEnvs()
})

it('mounts a standalone panel with defaults and disposes it', () => {
  const cleanup = PacerDevtoolsPanel()(() => ({}), host)
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]).toEqual([
    host.firstElementChild,
    { theme: 'dark', devtoolsOpen: true },
  ])
  cleanup()
  expect(core.unmount).toHaveBeenCalledOnce()
})

it('supplies a functional render factory and preserves dock props', () => {
  const plugin = pacerDevtoolsPlugin()
  expect(plugin.name).toBe('TanStack Pacer')
  expect(plugin.render).toBe(PacerDevtoolsPanel)
  // The official Angular dock treats functions with prototypes as components.
  expect(plugin.render.prototype).toBeUndefined()
  const render = plugin.render as typeof PacerDevtoolsPanel
  const cleanup = render()(
    () => ({ theme: 'light', devtoolsOpen: false }),
    host,
  )
  expect(core.mount.mock.calls[0]![1]).toEqual({
    theme: 'light',
    devtoolsOpen: false,
  })
  cleanup()
  expect(core.unmount).toHaveBeenCalledOnce()
})

it('keeps no-op panels and plugins inert', () => {
  expect(PacerDevtoolsPanelNoOp()).toBeNull()
  expect(pacerDevtoolsNoOpPlugin().render).toBeNull()
  expect(core.mount).not.toHaveBeenCalled()
  expect(host.childNodes).toHaveLength(0)
})

it.each(['development', 'production'])(
  'selects the correct root exports in %s',
  async (mode) => {
    vi.stubEnv('NODE_ENV', mode)
    vi.resetModules()
    const entry = await import('../src/index')
    const plugin = entry.pacerDevtoolsPlugin()
    if (mode === 'development') {
      expect(entry.PacerDevtoolsPanel()).toBeTypeOf('function')
      expect(plugin.render).toBe(entry.PacerDevtoolsPanel)
    } else {
      expect(entry.PacerDevtoolsPanel()).toBeNull()
      expect(plugin.render).toBeNull()
    }
  },
)

it('keeps the explicit production entry functional in production', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  const entry = await import('../src/production')
  const cleanup = entry.PacerDevtoolsPanel()(() => ({}), host)
  expect(core.mount).toHaveBeenCalledOnce()
  expect(entry.pacerDevtoolsPlugin().render).toBe(entry.PacerDevtoolsPanel)
  cleanup()
  expect(core.unmount).toHaveBeenCalledOnce()
})
