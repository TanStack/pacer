import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'

export interface PacerDevtoolsPreactInit extends DevtoolsPanelProps {}

const [PacerDevtoolsPanel, PacerDevtoolsPanelNoOp] =
  createPreactPanel(PacerDevtoolsCore)

export { PacerDevtoolsPanel, PacerDevtoolsPanelNoOp }
