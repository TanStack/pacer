<script lang="ts">
  import { PacerProvider } from '@tanstack/svelte-pacer/provider'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import Example from './Example.svelte'
</script>

<PacerProvider><Example /></PacerProvider>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
