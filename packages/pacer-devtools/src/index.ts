'use client'

import * as Devtools from './core'

// Create a dummy class for production that does nothing
class DummyPacerDevtoolsCore {
  constructor() {}
  mount() {}
  unmount() {}
}

export const PacerDevtoolsCore: (typeof Devtools)['PacerDevtoolsCore'] =
  process.env.NODE_ENV !== 'development'
    ? (DummyPacerDevtoolsCore as any)
    : Devtools.PacerDevtoolsCore

export type { PacerDevtoolsInit } from './core'
