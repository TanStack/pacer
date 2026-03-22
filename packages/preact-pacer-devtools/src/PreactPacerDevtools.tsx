import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'preact'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'

export interface PacerDevtoolsPreactInit extends DevtoolsPanelProps {}

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createPreactPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (typeof pacerDevtoolsPanels)[0]

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[0]
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[1]
