<script lang="ts">
  import {
    QueryClient,
    QueryClientProvider,
    createQuery,
  } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { createDebouncedValue } from '@tanstack/svelte-pacer'

  interface Post {
    id: number
    title: string
    body: string
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  })

  async function fetchPosts(): Promise<Array<Post>> {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    return response.json()
  }

  async function fetchPost(id: number): Promise<Post> {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a slow response.
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${id}`,
    )
    return response.json()
  }

  let selectedPostId = $state<number | null>(null)

  const posts = createQuery(
    () => ({
      queryKey: ['posts'],
      queryFn: fetchPosts,
    }),
    () => queryClient,
  )
  let currentHoveredPostId = $state<number | null>(null)
  const [scheduledHoveredPostId] = createDebouncedValue(
    () => currentHoveredPostId,
    {
      wait: 100,
    },
  )

  // Prefetch when Pacer commits the hovered post id.
  $effect(() => {
    const id = scheduledHoveredPostId()
    if (id)
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
  })

  const post = createQuery(
    () => ({
      queryKey: ['post', selectedPostId],
      enabled: selectedPostId !== null,
      queryFn: () => fetchPost(selectedPostId!),
    }),
    () => queryClient,
  )
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
      {#if posts.isLoading}
        <div>Loading posts...</div>
      {:else}
        <div>
          <h2>Posts</h2>
          <ul style="margin: 0; padding: 0">
            {#each posts.data ?? [] as post (post.id)}
              <li style="margin: 2px 0">
                <a
                  href={`#post-${post.id}`}
                  onmouseenter={() => (currentHoveredPostId = post.id)}
                  onclick={() => (selectedPostId = post.id)}
                  style="display: block; padding: 4px; cursor: pointer"
                  >{post.title}</a
                >
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if selectedPostId}{#if post.isLoading}
          <div>Loading post...</div>
        {:else}
          <div>
            <h3>{post.data?.title}</h3>
            <p>{post.data?.body}</p>
          </div>
        {/if}{/if}
    </div>
  </div>
  {#if import.meta.env.DEV}<SvelteQueryDevtools initialIsOpen={false} />{/if}
</QueryClientProvider>
