<script lang="ts">
  import {
    QueryClient,
    QueryClientProvider,
    createQuery,
    keepPreviousData,
  } from '@tanstack/svelte-query'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { createDebouncedValue } from '@tanstack/svelte-pacer'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import QueryDevtoolsPanel from './QueryDevtoolsPanel.svelte'

  interface Post {
    id: number
    title: string
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  })

  const posts: Array<Post> = [
    'Getting started with TanStack Query',
    'Debouncing user input',
    'Throttling scroll handlers',
    'Rate limiting API calls',
    'Queueing background work',
    'Batching writes to the server',
    'Prefetching data on hover',
    'Caching search results',
    'Cancelling stale requests',
    'Optimistic updates with mutations',
    'Retrying failed queries',
    'Keeping previous data while fetching',
  ].map((title, index) => ({ id: index + 1, title }))

  // A fake search API with a slow response that can be cancelled
  function searchPosts(term: string, signal: AbortSignal) {
    return new Promise<Array<Post>>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(
          posts.filter((post) =>
            post.title.toLowerCase().includes(term.toLowerCase()),
          ),
        )
      }, 500)
      signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(signal.reason)
      })
    })
  }

  let search = $state('')
  let requests = $state({ sent: 0, cancelled: 0 })

  // Debounce the search term, not the query function. Each debounced term
  // becomes its own query key, so Query caches every term separately.
  const [debouncedSearch] = createDebouncedValue(() => search, {
    key: 'Post Search Debouncer', // identifies this debouncer in the Pacer devtools
    wait: 300, // adjust this value to see the difference
  })
  const term = $derived(debouncedSearch().trim())

  const searchQuery = createQuery(
    () => ({
      queryKey: ['posts', 'search', term],
      queryFn: ({ signal }) => {
        requests.sent++
        // Query aborts the signal when a newer term replaces this one
        signal.addEventListener('abort', () => requests.cancelled++)
        return searchPosts(term, signal)
      },
      enabled: term.length > 0,
      // Keep showing the last results while the next term loads
      placeholderData: keepPreviousData,
    }),
    () => queryClient,
  )

  const status = $derived(
    search !== debouncedSearch()
      ? 'Typing...'
      : searchQuery.isFetching
        ? 'Searching...'
        : !term
          ? 'Type to search'
          : searchQuery.isError
            ? 'Search failed'
            : `Matches for "${term}": ${searchQuery.data?.length ?? 0}`,
  )

  // Open the Pacer and Query panels as tabs to watch searches run
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
    <h1>TanStack Pacer/Query Debounced Search Example</h1>
    <p>
      The search term is debounced, so a query only runs once you stop typing
      for 300ms. While the next results load, the previous results stay on
      screen.
    </p>
    <p>
      When a newer term replaces a search that is still running, Query cancels
      the older request through its abort signal.
    </p>
    <label style="display: block; margin-bottom: 8px">
      Search posts
      <input bind:value={search} placeholder="Try 'query' or 'data'" />
    </label>
    <p>{status}</p>
    <ul style:opacity={searchQuery.isPlaceholderData ? 0.5 : 1}>
      {#if term}
        {#each searchQuery.data ?? [] as post (post.id)}
          <li>{post.title}</li>
        {/each}
      {/if}
    </ul>
    <p>Requests sent: {requests.sent} | Cancelled: {requests.cancelled}</p>
  </div>
  {#if import.meta.env.DEV}<TanStackDevtools {plugins} />{/if}
</QueryClientProvider>
