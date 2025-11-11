import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsPanel } from './ReactPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createReactPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
