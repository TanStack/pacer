import { constructCoreClass } from '@tanstack/devtools-utils/solid'

export interface PacerDevtoolsInit {}

const [PacerDevtoolsCore, PacerDevtoolsCoreNoOp] = constructCoreClass(() => import('./PacerDevtools'))

export { PacerDevtoolsCore, PacerDevtoolsCoreNoOp }
