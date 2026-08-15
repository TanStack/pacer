import { h } from 'preact'
import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'preact'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'

export interface PacerDevtoolsPreactInit extends Partial<DevtoolsPanelProps> {}

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createPreactPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (
  props?: PacerDevtoolsPreactInit,
) => JSX.Element

function resolvePanelProps(
  props?: PacerDevtoolsPreactInit,
): DevtoolsPanelProps {
  return {
    theme: props?.theme ?? 'dark',
    devtoolsOpen: props?.devtoolsOpen ?? false,
  }
}

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent = (props) =>
  h(pacerDevtoolsPanels[0], resolvePanelProps(props))
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent = (props) =>
  h(pacerDevtoolsPanels[1], resolvePanelProps(props))
