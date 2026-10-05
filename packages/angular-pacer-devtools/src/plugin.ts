import { createAngularPlugin } from '@tanstack/devtools-utils/angular'
import { PacerDevtoolsPanel } from './AngularPacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createAngularPlugin({
  name: 'TanStack Pacer',
  render: PacerDevtoolsPanel,
})

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
