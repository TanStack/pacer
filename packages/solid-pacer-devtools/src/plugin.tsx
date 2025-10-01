import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { PacerDevtoolsPanel } from './SolidPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createSolidPlugin(
  'TanStack Pacer',
  PacerDevtoolsPanel,
)

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
