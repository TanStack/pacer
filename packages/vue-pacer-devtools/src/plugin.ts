import { PacerDevtoolsPanel, PacerDevtoolsPanelNoOp } from './VuePacerDevtools'
import type { PacerDevtoolsVueInit } from './VuePacerDevtools'

/** Registers the Pacer panel with a Vue devtools host. */
export function pacerDevtoolsPlugin(props: PacerDevtoolsVueInit = {}) {
  return { name: 'TanStack Pacer', component: PacerDevtoolsPanel, props }
}

/** Production-default plugin with an inert panel. */
export function pacerDevtoolsNoOpPlugin(props: PacerDevtoolsVueInit = {}) {
  return { name: 'TanStack Pacer', component: PacerDevtoolsPanelNoOp, props }
}
