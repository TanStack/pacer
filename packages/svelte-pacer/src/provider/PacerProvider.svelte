<script lang="ts">
  import { providePacerOptions } from './PacerProvider'
  import type { Snippet } from 'svelte'
  import type { PacerProviderOptions } from './PacerProvider'

  let {
    defaultOptions = {},
    children,
  }: { defaultOptions?: PacerProviderOptions; children?: Snippet } = $props()
  providePacerOptions(() => defaultOptions)
</script>

{@render children?.()}
