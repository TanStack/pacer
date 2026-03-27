import { constructCoreClass } from '@tanstack/devtools-utils/solid'
import type { ClassType } from '@tanstack/devtools-utils/solid'

export interface PacerDevtoolsInit {}

const coreClasses = constructCoreClass(() => import('./components'))

export const PacerDevtoolsCore: ClassType = coreClasses[0]
export const PacerDevtoolsCoreNoOp: ClassType = coreClasses[1]
