import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { PacerDevtoolsPanel } from './PreactPacerDevtools'

type PacerDevtoolsPluginFactory = ReturnType<typeof createPreactPlugin>[0]

const pacerDevtoolsPlugins = createPreactPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export const pacerDevtoolsPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[0]
export const pacerDevtoolsNoOpPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[1]
