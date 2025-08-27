'use client'

import React from 'react'
import * as Devtools from './ReactPacerDevtools'

export const PacerDevtoolsPanel: (typeof Devtools)['PacerDevtoolsPanel'] =
  process.env.NODE_ENV !== 'development'
    ? function () {
        return React.createElement('div')
      }
    : Devtools.PacerDevtoolsPanel

export type { PacerDevtoolsReactInit } from './ReactPacerDevtools'
