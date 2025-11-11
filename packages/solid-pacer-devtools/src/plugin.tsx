import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { PacerDevtoolsPanel } from './SolidPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createSolidPlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
