import { defineComponent } from 'vue'
import { select } from './select'
import type { ReadonlyStore } from '@tanstack/vue-store'
import type { PropType, VNodeChild } from 'vue'

/** A scoped-slot component that subscribes only its children to selected utility state. */
export type VuePacerSubscribe<TState> = new <TSelected>(props: {
  selector: (state: TState) => TSelected
}) => {
  $props: { selector: (state: TState) => TSelected }
  $slots: { default: (state: TSelected) => VNodeChild }
}

/** Creates the stable Subscribe component attached to a utility instance. */
export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>,
): VuePacerSubscribe<TState> {
  return defineComponent({
    name: 'PacerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: TState) => unknown>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = select(store, (state) => props.selector(state))
      return () => slots.default?.(selected.value)
    },
  }) as unknown as VuePacerSubscribe<TState>
}
