'use client'

import * as Devtools from './core'
import * as plugin from './plugin'

export const PacerDevtoolsCore: typeof Devtools.PacerDevtoolsCore =
  process.env.NODE_ENV !== 'development'
    ? Devtools.PacerDevtoolsCoreNoOp
    : Devtools.PacerDevtoolsCore

export type { PacerDevtoolsInit } from './core'

export const pacerDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.pacerDevtoolsNoOpPlugin
    : plugin.pacerDevtoolsPlugin
