'use client'

import * as Devtools from './SolidPacerDevtools'

export const PacerDevtoolsPanel: (typeof Devtools)['PacerDevtoolsPanel'] =
  process.env.NODE_ENV !== 'development'
    ? function () {
      return null
    }
    : Devtools.PacerDevtoolsPanel

export type { PacerDevtoolsSolidInit } from './SolidPacerDevtools'

export { pacerDevtoolsPlugin } from './plugin'