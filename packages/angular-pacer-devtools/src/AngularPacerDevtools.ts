import { createAngularPanel } from '@tanstack/devtools-utils/angular'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools/production'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/angular'

export interface PacerDevtoolsAngularInit extends Partial<DevtoolsPanelProps> {}

const [createPanel, PacerDevtoolsPanelNoOp] =
  createAngularPanel(PacerDevtoolsCore)

// Angular Devtools distinguishes render factories from components by prototype.
export const PacerDevtoolsPanel = () => {
  const render = createPanel()
  return (inputs: () => PacerDevtoolsAngularInit, host: HTMLElement) =>
    render(() => {
      const props = inputs()
      return {
        ...props,
        theme: props.theme ?? 'dark',
        devtoolsOpen: props.devtoolsOpen ?? true,
      }
    }, host)
}

export { PacerDevtoolsPanelNoOp }
