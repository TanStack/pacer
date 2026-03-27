import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { PacerDevtoolsPanel } from './SolidPacerDevtools'

type PacerDevtoolsPluginFactory = ReturnType<typeof createSolidPlugin>[0]

const pacerDevtoolsPlugins = createSolidPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export const pacerDevtoolsPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[0]
export const pacerDevtoolsNoOpPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[1]
