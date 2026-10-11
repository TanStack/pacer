import Helper from '@ember/component/helper'
import { select } from './select'
import type { ReadonlyStore } from '@tanstack/store'

type SubscribeSignature<TState, TSelected> = {
  Args: { Positional: [selector: (state: TState) => TSelected] }
  Return: TSelected
}

/** A contextual helper that selects state in the consuming template's lifecycle. */
export type EmberPacerSubscribe<TState> = new <TSelected>(
  ...args: ConstructorParameters<typeof Helper>
) => Helper<SubscribeSignature<TState, TSelected>>

export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'state' | 'subscribe'>,
): EmberPacerSubscribe<TState> {
  return class Subscribe<TSelected> extends Helper<
    SubscribeSignature<TState, TSelected>
  > {
    private selection?: { readonly value: TSelected }
    private selector!: (state: TState) => TSelected

    compute([selector]: [(state: TState) => TSelected]): TSelected {
      this.selector = selector
      this.selection ??= select(this, store, (state) => this.selector(state))
      return this.selection.value
    }
  }
}
