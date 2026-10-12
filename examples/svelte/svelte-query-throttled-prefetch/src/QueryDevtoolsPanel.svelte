<script lang="ts">
  // Svelte Query has no devtools panel component yet, so mount the core panel
  // into the TanStack Devtools plugin container
  import { onlineManager } from '@tanstack/svelte-query'
  import { TanstackQueryDevtoolsPanel } from '@tanstack/query-devtools'
  import type { QueryClient } from '@tanstack/svelte-query'

  let { client, theme }: { client: QueryClient; theme?: 'light' | 'dark' } =
    $props()

  // Runs again with a fresh panel if the client or theme changes
  function mountPanel(element: HTMLElement) {
    const panel = new TanstackQueryDevtoolsPanel({
      client,
      queryFlavor: 'Svelte Query',
      version: '5',
      onlineManager,
    })
    panel.setTheme(theme)
    panel.mount(element)
    return () => panel.unmount()
  }
</script>

<div class="tsqd-parent-container" style="height: 100%" {@attach mountPanel}></div>
