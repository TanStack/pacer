import type { PacerDevtoolsSvelteInit } from '../src/SveltePacerDevtools'

export function createPanelProps() {
  const props = $state<PacerDevtoolsSvelteInit>({})
  return props
}
