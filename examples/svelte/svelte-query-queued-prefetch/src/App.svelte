<script lang="ts">
  import {
    QueryClient,
    QueryClientProvider,
    createQuery,
    queryOptions,
  } from '@tanstack/svelte-query'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { createAsyncQueuer } from '@tanstack/svelte-pacer'
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
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response
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

  // Each hovered post is queued, and the queue runs at most 2 prefetches at a
  // time so a fast sweep across the list can't flood the server.
  const prefetchQueuer = createAsyncQueuer(
    // `query` fetches only when the cached post is missing or stale, so cached
    // posts leave the queue immediately. The queuer catches a failed prefetch;
    // the post detail will retry and show the error.
    (postId: number) => queryClient.query(postQueryOptions(postId)),
    {
      key: 'Post Prefetch Queue', // identifies this queuer in the Pacer devtools
      concurrency: 2, // at most 2 prefetches in flight
      addItemsTo: 'front', // newest hovered post is top priority
      expirationDuration: 1000, // drop posts still waiting 1s after they were hovered
      onExpire: (postId) => {
        console.log('expired', postId)
      },
    },
  )

  function handleMouseEnter(postId: number) {
    // skip posts that are already waiting or being prefetched
    if (prefetchQueuer.peekAllItems().includes(postId)) return
    prefetchQueuer.addItem(postId)
  }

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
    <h1>TanStack Pacer/Query Queued Prefetch Example</h1>
    <p>Hover over a post title to queue up its prefetch</p>
    <p>
      Every hovered post joins a queue that runs at most 2 prefetches at once,
      so sweeping across the list never floods the server. The most recently
      hovered post goes first, and posts still waiting after 1 second are
      dropped because you have probably moved on.
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
          <!-- Only this line updates when the queue changes -->
          <prefetchQueuer.Subscribe
            selector={(state) => ({
              prefetching: state.activeItems,
              queued: state.items,
            })}
          >
            {#snippet children({ prefetching, queued })}
              <p>
                Prefetching: {prefetching.join(', ') || 'none'} | Queued: {queued.join(
                  ', ',
                ) || 'none'}
              </p>
            {/snippet}
          </prefetchQueuer.Subscribe>
          <ul style="margin: 0; padding: 0">
            {#each posts.data as item (item.id)}
              <li style="margin: 2px 0">
                <a
                  href={`#post-${item.id}`}
                  onmouseenter={() => handleMouseEnter(item.id)}
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
