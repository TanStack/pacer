<script lang="ts">
  import { PacerProvider } from '@tanstack/svelte-pacer/provider'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import Counter from './Counter.svelte'
  import Range from './Range.svelte'
  import Search from './Search.svelte'
</script>

<PacerProvider
  ><div>
    <Counter />
    <hr />
    <Search />
    <hr />
    <Range />
  </div></PacerProvider
>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
