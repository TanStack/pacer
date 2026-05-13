import { createElement } from 'react'
import { createReactPanel } from '@tanstack/devtools-utils/react'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import type { JSX } from 'react'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'

export interface PacerDevtoolsReactInit extends Partial<DevtoolsPanelProps> {}

const pacerDevtoolsPanels: readonly [
  (props: DevtoolsPanelProps) => JSX.Element,
  (props: DevtoolsPanelProps) => JSX.Element,
] = createReactPanel(PacerDevtoolsCore)

type PacerDevtoolsPanelComponent = (
  props?: PacerDevtoolsReactInit,
) => JSX.Element

function resolvePanelProps(props?: PacerDevtoolsReactInit): DevtoolsPanelProps {
  return {
    theme: props?.theme ?? 'dark',
    devtoolsOpen: props?.devtoolsOpen ?? false,
  }
}

export const PacerDevtoolsPanel: PacerDevtoolsPanelComponent = (props) =>
  createElement(pacerDevtoolsPanels[0], resolvePanelProps(props))
export const PacerDevtoolsPanelNoOp: PacerDevtoolsPanelComponent = (props) =>
  createElement(pacerDevtoolsPanels[1], resolvePanelProps(props))
