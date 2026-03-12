import { constructCoreClass } from '@tanstack/devtools-utils/solid'

export interface PacerDevtoolsInit {}

const [PacerDevtoolsCore, PacerDevtoolsCoreNoOp] = constructCoreClass(
  () => import('./components'),
)

export { PacerDevtoolsCore, PacerDevtoolsCoreNoOp }
