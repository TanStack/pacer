import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'solid-js'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createSolidPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (
  props?: PacerDevtoolsSolidInit,
) => JSX.Element

function resolvePanelProps(props?: PacerDevtoolsSolidInit): DevtoolsPanelProps {
  return {
    theme: props?.theme ?? 'dark',
    devtoolsOpen: props?.devtoolsOpen ?? false,
  }
}

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent = (props) =>
  pacerDevtoolsPanels[0](resolvePanelProps(props))
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent = (props) =>
  pacerDevtoolsPanels[1](resolvePanelProps(props))

export interface PacerDevtoolsSolidInit extends Partial<DevtoolsPanelProps> {}
