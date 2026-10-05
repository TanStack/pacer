import Subscribe from './Subscribe.svelte'
import type { ReadonlyStore } from '@tanstack/svelte-store'
import type {
  Component,
  ComponentConstructorOptions,
  Snippet,
  SvelteComponent,
} from 'svelte'

type SubscribeProps<TState, TSelected> = {
  selector: (state: TState) => TSelected
  children: Snippet<[TSelected]>
}

/** A component that renders a snippet with selected utility state. */
export interface SveltePacerSubscribe<TState> {
  // Svelte's generic component declarations include a constructor for template
  // inference, even though Svelte 5 mounts the callable component at runtime.
  new <TSelected>(
    options: ComponentConstructorOptions<SubscribeProps<TState, TSelected>>,
  ): SvelteComponent<SubscribeProps<TState, TSelected>>
  <TSelected>(
    internals: Parameters<Component>[0],
    props: SubscribeProps<TState, TSelected>,
  ): ReturnType<Component>
}

/** Binds the utility's store while retaining reactive component props. */
export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>,
): SveltePacerSubscribe<TState> {
  const BoundSubscribe = <TSelected>(
    internals: Parameters<Component>[0],
    props: SubscribeProps<TState, TSelected>,
  ) =>
    Subscribe(internals, {
      store,
      get selector() {
        return props.selector
      },
      get children() {
        return props.children
      },
    })
  return BoundSubscribe as SveltePacerSubscribe<TState>
}
