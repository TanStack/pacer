import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { PacerDevtoolsPanel } from './PreactPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createPreactPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
