import { shallow } from '@tanstack/octane-store'
import { select } from './slots'
import type { ReadonlyStore } from '@tanstack/octane-store'
import type { OctaneNode } from 'octane'

/** A child component that renders selected utility state without updating its owner. */
export type OctanePacerSubscribe<TState> = <TSelected>(props: {
  selector: (state: TState) => TSelected
  children: (selected: TSelected) => OctaneNode
}) => OctaneNode

export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>,
): OctanePacerSubscribe<TState> {
  const slot = Symbol('pacer-subscribe')
  return function Subscribe({ selector, children }) {
    return children(select(store, selector, { compare: shallow }, slot))
  }
}
