
import { createSolidPanel } from "@tanstack/devtools-utils/solid"
import { PacerDevtoolsCore } from "@tanstack/pacer-devtools"
import type { DevtoolsPanelProps } from "@tanstack/devtools-utils/solid";

const [PacerDevtoolsPanel, PacerDevtoolsPanelNoOp] = createSolidPanel(PacerDevtoolsCore)
export interface PacerDevtoolsSolidInit extends DevtoolsPanelProps {
}

export { PacerDevtoolsPanel, PacerDevtoolsPanelNoOp }