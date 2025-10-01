import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsPanel } from './ReactPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createReactPlugin(
  'TanStack Pacer',
  PacerDevtoolsPanel,
)

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
