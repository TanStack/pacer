import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { PacerDevtoolsPanel } from '../src'

describe('PacerDevtoolsPanel props', () => {
  it('allows standalone usage without TanStack Devtools props', () => {
    expect(<PacerDevtoolsPanel />).toBeTruthy()
    expect(<PacerDevtoolsPanel theme="dark" />).toBeTruthy()
    expect(<PacerDevtoolsPanel devtoolsOpen={false} />).toBeTruthy()
  })
})
