<script lang="ts">
  import {
    QueryClient,
    QueryClientProvider,
    createQuery,
    noop,
    queryOptions,
  } from '@tanstack/svelte-query'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { createDebouncer } from '@tanstack/svelte-pacer'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import QueryDevtoolsPanel from './QueryDevtoolsPanel.svelte'

  interface Post {
    id: number
    title: string
    body: string
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  })

  async function fetchJson<TData>(url: string, signal: AbortSignal) {
    const response = await fetch(url, { signal })
    // fetch only rejects on network errors, so turn 4xx/5xx into query errors
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return response.json() as Promise<TData>
  }

  const postsQueryOptions = queryOptions({
    queryKey: ['posts'],
    queryFn: ({ signal }) =>
      fetchJson<Array<Post>>(
        'https://jsonplaceholder.typicode.com/posts',
        signal,
      ),
  })

  // Share one options object between the prefetch and `createQuery` so the
  // key and fetcher can never drift apart
  const postQueryOptions = (postId: number) =>
    queryOptions({
      queryKey: ['post', postId],
      queryFn: async ({ signal }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a slow response
        return fetchJson<Post>(
          `https://jsonplaceholder.typicode.com/posts/${postId}`,
          signal,
        )
      },
    })

  let selectedPostId = $state<number | null>(null)

  const posts = createQuery(
    () => postsQueryOptions,
    () => queryClient,
  )

  // Debounce the prefetch itself rather than a hovered-id state value. Only
  // the post the pointer rests on is prefetched.
  const prefetcher = createDebouncer(
    (postId: number) => {
      // `query` fetches only when the cached post is missing or stale. A
      // failed prefetch is ignored here; the post detail will retry and show
      // the error.
      queryClient.query(postQueryOptions(postId)).catch(noop)
    },
    {
      key: 'Post Prefetch Debouncer', // identifies this debouncer in the Pacer devtools
      wait: 100, // adjust this value to see the difference
    },
  )

  const post = createQuery(
    () => ({
      ...postQueryOptions(selectedPostId ?? 0),
      enabled: selectedPostId !== null,
    }),
    () => queryClient,
  )

  // Open the Pacer and Query panels as tabs to watch prefetches land
  const plugins = [
    { ...pacerDevtoolsPlugin(), defaultOpen: true },
    {
      name: 'TanStack Query',
      component: QueryDevtoolsPanel,
      props: { client: queryClient },
      defaultOpen: true,
    },
  ]
</script>

<QueryClientProvider client={queryClient}>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Debounced Prefetch Example</h1>
    <p>Hover over a post title to prefetch its content</p>
    <p>
      The prefetch is debounced, so it only runs once the pointer rests on a
      post for 100ms. Sweeping across the list prefetches nothing until you
      stop, and leaving the list cancels the pending prefetch.
    </p>
    <p>
      Prefetched posts stay fresh for 10 seconds. Hovering a post after that
      refreshes it in the background.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      {#if posts.isPending}
        <div>Loading posts...</div>
      {:else if posts.isError}
        <div>Could not load posts.</div>
      {:else}
        <div>
          <h2>Posts</h2>
          <!-- Leaving the list before the debounce settles cancels the prefetch -->
          <ul
            style="margin: 0; padding: 0"
            onmouseleave={() => prefetcher.cancel()}
          >
            {#each posts.data as item (item.id)}
              <li style="margin: 2px 0">
                <a
                  href={`#post-${item.id}`}
                  onmouseenter={() => prefetcher.maybeExecute(item.id)}
                  onclick={() => (selectedPostId = item.id)}
                  style="display: block; padding: 4px; cursor: pointer"
                  >{item.title}</a
                >
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if selectedPostId !== null}
        {#if post.isPending}
          <div>Loading post...</div>
        {:else if post.isError}
          <div>Could not load post.</div>
        {:else}
          <div>
            <h3>{post.data.title}</h3>
            <p>{post.data.body}</p>
          </div>
        {/if}
      {/if}
    </div>
  </div>
  {#if import.meta.env.DEV}<TanStackDevtools {plugins} />{/if}
</QueryClientProvider>
