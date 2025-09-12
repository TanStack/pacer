import React from 'react'
import { PacerDevtoolsPanel } from './production'

export function pacerDevtoolsPlugin() {
  return {
    name: 'TanStack Pacer',
    render: (_el: HTMLElement, theme: 'light' | 'dark') => {
      return <PacerDevtoolsPanel theme={theme} />
    },
  }
}
