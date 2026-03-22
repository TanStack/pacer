import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'solid-js'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createSolidPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (typeof pacerDevtoolsPanels)[0]

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[0]
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent =
  pacerDevtoolsPanels[1]

export interface PacerDevtoolsSolidInit extends DevtoolsPanelProps {}
