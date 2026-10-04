<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { queryClient } from './api'
  import PostList from './PostList.svelte'
  import PostDetail from './PostDetail.svelte'

  let selectedPostId = $state<number | null>(null)
</script>

<QueryClientProvider client={queryClient}>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Queued Prefetch Example</h1>
    <p>Hover over a post title to queue up its prefetch</p>
    <p>
      This example shows how to queue up prefetch requests when the user hovers
      over a post, processing them in order with a delay between each.
    </p>
    <p>
      The queued query key is processed after a delay to avoid overwhelming the
      server with too many requests at once.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <PostList onSelect={(id) => (selectedPostId = id)} />
      {#if selectedPostId}<PostDetail postId={selectedPostId} />{/if}
    </div>
  </div>
  {#if import.meta.env.DEV}<SvelteQueryDevtools initialIsOpen={false} />{/if}
</QueryClientProvider>
