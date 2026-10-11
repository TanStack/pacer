import { createSveltePanel } from '@tanstack/devtools-utils/svelte'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools/production'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/svelte'
import type { Component } from 'svelte'

export interface PacerDevtoolsSvelteInit extends Partial<DevtoolsPanelProps> {}

const panels = createSveltePanel(PacerDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): Component<PacerDevtoolsSvelteInit> {
  return (internals, props) =>
    Panel(internals, {
      get theme() {
        return props.theme ?? 'dark'
      },
      get devtoolsOpen() {
        return props.devtoolsOpen ?? true
      },
    })
}

export const PacerDevtoolsPanel = withDefaults(panels[0])
export const PacerDevtoolsPanelNoOp = withDefaults(panels[1])
