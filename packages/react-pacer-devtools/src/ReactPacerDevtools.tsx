import { createReactPanel } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'react'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'

export interface PacerDevtoolsReactInit extends DevtoolsPanelProps {}

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createReactPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (typeof pacerDevtoolsPanels)[0]

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[0]
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[1]
