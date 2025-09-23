
import { constructCoreClass } from '@tanstack/devtools-utils/solid'
import { lazy } from 'solid-js'

const Component = lazy(() => import('./PacerDevtools'))

export interface PacerDevtoolsInit { }

const [PacerDevtoolsCore, PacerDevtoolsCoreNoOp] = constructCoreClass(Component)

export { PacerDevtoolsCore, PacerDevtoolsCoreNoOp }