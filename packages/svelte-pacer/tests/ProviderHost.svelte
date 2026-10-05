<script lang="ts">
  import { providePacerOptions } from '../src/provider/PacerProvider'
  import Host from './Host.svelte'
  import type { PacerProviderOptions } from '../src/provider/PacerProvider'
  let {
    defaults,
    setup,
  }: { defaults: () => PacerProviderOptions; setup: () => void } = $props()
  providePacerOptions(() => defaults())
</script>

<Host {setup} />
