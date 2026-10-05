import { mount, tick, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  PacerDevtoolsPanel,
  PacerDevtoolsPanelNoOp,
} from '../src/SveltePacerDevtools'
import { pacerDevtoolsNoOpPlugin, pacerDevtoolsPlugin } from '../src/plugin'
import { createPanelProps } from './panel-state.svelte'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/pacer-devtools/production', () => ({
  PacerDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

let host: HTMLDivElement
let panel: ReturnType<typeof mount> | undefined
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(async () => {
  if (panel) await unmount(panel)
  panel = undefined
  host.remove()
  vi.unstubAllEnvs()
})

it('mounts a standalone panel with defaults and disposes it', async () => {
  panel = mount(PacerDevtoolsPanel, { target: host })
  await tick()
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]![0]).toBe(host.querySelector('div'))
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  await unmount(panel)
  panel = undefined
  expect(core.unmount).toHaveBeenCalledOnce()
})

it('preserves props supplied by the dock', async () => {
  const plugin = pacerDevtoolsPlugin()
  expect(plugin.name).toBe('TanStack Pacer')
  panel = mount(plugin.component, {
    target: host,
    props: { theme: 'light', devtoolsOpen: false },
  })
  await tick()
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('keeps live props readable by the mounted core without remounting', async () => {
  const props = createPanelProps()
  panel = mount(PacerDevtoolsPanel, { target: host, props })
  await tick()
  const mountedProps = core.mount.mock.calls[0]![1]
  props.theme = 'light'
  props.devtoolsOpen = false
  await tick()
  expect(mountedProps).toMatchObject({ theme: 'light', devtoolsOpen: false })
  expect(core.mount).toHaveBeenCalledOnce()
})

it('keeps no-op panels and plugins inert', async () => {
  panel = mount(PacerDevtoolsPanelNoOp, { target: host })
  await tick()
  await unmount(panel)
  panel = mount(pacerDevtoolsNoOpPlugin().component, { target: host })
  await tick()
  expect(core.mount).not.toHaveBeenCalled()
  expect(core.unmount).not.toHaveBeenCalled()
  expect(host.textContent).toBe('')
})

it.each(['development', 'production'])(
  'selects the correct root exports in %s',
  async (mode) => {
    vi.stubEnv('NODE_ENV', mode)
    vi.resetModules()
    const entry = await import('../src/index')
    const devtools = await import('../src/SveltePacerDevtools')
    const plugins = await import('../src/plugin')
    expect(entry.PacerDevtoolsPanel).toBe(
      mode === 'development'
        ? devtools.PacerDevtoolsPanel
        : devtools.PacerDevtoolsPanelNoOp,
    )
    expect(entry.pacerDevtoolsPlugin).toBe(
      mode === 'development'
        ? plugins.pacerDevtoolsPlugin
        : plugins.pacerDevtoolsNoOpPlugin,
    )
  },
)

it('keeps the explicit production entry functional in production', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  // resetModules reloads Svelte too; mount with the same runtime as this entry.
  const runtime = await import('svelte')
  const entry = await import('../src/production')
  const productionPanel = runtime.mount(entry.pacerDevtoolsPlugin().component, {
    target: host,
  })
  await runtime.tick()
  expect(core.mount).toHaveBeenCalledOnce()
  await runtime.unmount(productionPanel)
  expect(core.unmount).toHaveBeenCalledOnce()
})
