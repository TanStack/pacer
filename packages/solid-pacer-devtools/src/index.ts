
import * as Devtools from './SolidPacerDevtools'
import * as plugin from './plugin'

export const PacerDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? Devtools.PacerDevtoolsPanelNoOp
    : Devtools.PacerDevtoolsPanel

export const pacerDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.pacerDevtoolsNoOpPlugin
    : plugin.pacerDevtoolsPlugin

export type { PacerDevtoolsSolidInit } from './SolidPacerDevtools'
