'use client'

import * as Devtools from './PreactPacerDevtools'
import * as plugin from './plugin'

export const PacerDevtoolsPanel: typeof Devtools.PacerDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? Devtools.PacerDevtoolsPanelNoOp
    : Devtools.PacerDevtoolsPanel

export const pacerDevtoolsPlugin: typeof plugin.pacerDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.pacerDevtoolsNoOpPlugin
    : plugin.pacerDevtoolsPlugin

export type { PacerDevtoolsPreactInit } from './PreactPacerDevtools'
