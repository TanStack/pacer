<script lang="ts" generics="TState, TSelected">
  import { untrack } from 'svelte'
  import { select } from './select.svelte'
  import type { ReadonlyStore } from '@tanstack/svelte-store'
  import type { Snippet } from 'svelte'

  let {
    store,
    selector,
    children,
  }: {
    store: Pick<ReadonlyStore<TState>, 'get' | 'subscribe'>
    selector: (state: TState) => TSelected
    children: Snippet<[TSelected]>
  } = $props()
  // Each utility creates a stable component bound to its own store.
  const selected = select(
    untrack(() => store),
    (state) => selector(state),
  )
</script>

{@render children(selected.current)}
