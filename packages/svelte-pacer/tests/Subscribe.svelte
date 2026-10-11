<script lang="ts">
  import { untrack } from 'svelte'
  import { createDebouncer } from '../src'
  import type { SvelteDebouncer } from '../src'
  import type { DebouncerState } from '@tanstack/pacer'
  let {
    capture,
    report,
    selector = (state) => ({ pending: state.isPending }),
  }: {
    capture: (utility: SvelteDebouncer<() => void>) => void
    report: (pending: boolean) => string
    selector?: (state: DebouncerState<() => void>) => { pending: boolean }
  } = $props()
  const utility = createDebouncer(() => {}, { wait: 1000 })
  untrack(() => capture(utility))
  let visible = $state(true)
</script>

<button
  onclick={() => {
    visible = false
  }}>Remove child</button
>
{#if visible}
  <utility.Subscribe {selector}>
    {#snippet children(state)}<output>{report(state.pending)}</output>{/snippet}
  </utility.Subscribe>
{/if}
