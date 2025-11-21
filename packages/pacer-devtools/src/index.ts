'use client'

import * as Devtools from './core'

export const PacerDevtoolsCore =
  process.env.NODE_ENV !== 'development'
    ? Devtools.PacerDevtoolsCoreNoOp
    : Devtools.PacerDevtoolsCore

export type { PacerDevtoolsInit } from './core'
