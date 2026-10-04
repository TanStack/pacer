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
    <h1>TanStack Pacer/Query Debounced Prefetch Example</h1>
    <p>Hover over a post title to prefetch its content</p>
    <p>
      This example shows how to prefetch a query when the user hovers over a
      post.
    </p>
    <p>
      The debounced query key is created after a debounce to avoid excessive
      prefetches.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <PostList onSelect={(id) => (selectedPostId = id)} />
      {#if selectedPostId}<PostDetail postId={selectedPostId} />{/if}
    </div>
  </div>
  {#if import.meta.env.DEV}<SvelteQueryDevtools initialIsOpen={false} />{/if}
</QueryClientProvider>
