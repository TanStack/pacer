import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsPanel } from './ReactPacerDevtools'

type PacerDevtoolsPluginFactory = ReturnType<typeof createReactPlugin>[0]

const pacerDevtoolsPlugins = createReactPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export const pacerDevtoolsPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[0]
export const pacerDevtoolsNoOpPlugin: PacerDevtoolsPluginFactory =
  pacerDevtoolsPlugins[1]
