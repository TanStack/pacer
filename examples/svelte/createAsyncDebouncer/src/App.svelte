<script lang="ts">
  import { PacerProvider } from '@tanstack/svelte-pacer/provider'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import Example from './Example.svelte'
  let mounted = $state(true)
  function toggleMounted(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'Enter') mounted = !mounted
  }
</script>

<svelte:document onkeydown={toggleMounted} />
<PacerProvider
  >{#if mounted}<Example />{/if}</PacerProvider
>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
