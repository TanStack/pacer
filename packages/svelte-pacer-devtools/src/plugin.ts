import { createSveltePlugin } from '@tanstack/devtools-utils/svelte'
import { PacerDevtoolsPanel } from './SveltePacerDevtools'

const [pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin] = createSveltePlugin({
  name: 'TanStack Pacer',
  Component: PacerDevtoolsPanel,
})

export { pacerDevtoolsPlugin, pacerDevtoolsNoOpPlugin }
