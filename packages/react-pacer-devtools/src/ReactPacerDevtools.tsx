import { createReactPanel } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'

export interface PacerDevtoolsReactInit extends DevtoolsPanelProps {}

const [PacerDevtoolsPanel, PacerDevtoolsPanelNoOp] =
  createReactPanel(PacerDevtoolsCore)

export { PacerDevtoolsPanel, PacerDevtoolsPanelNoOp }
