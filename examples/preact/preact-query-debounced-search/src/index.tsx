import { render } from 'preact'
import { useState } from 'preact/hooks'
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from '@tanstack/preact-query'
import { PreactQueryDevtoolsPanel } from '@tanstack/preact-query-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { useDebouncedValue } from '@tanstack/preact-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/preact-pacer-devtools'

interface Post {
  id: number
  title: string
}

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

function App() {
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState({ sent: 0, cancelled: 0 })

  // Debounce the search term, not the query function. Each debounced term
  // becomes its own query key, so Query caches every term separately.
  const [debouncedSearch] = useDebouncedValue(search, {
    wait: 300, // adjust this value to see the difference
    key: 'Post Search Debouncer', // identifies this debouncer in the Pacer devtools
  })
  const term = debouncedSearch.trim()

  const searchQuery = useQuery({
    queryKey: ['posts', 'search', term],
    queryFn: ({ signal }) => {
      setRequests((count) => ({ ...count, sent: count.sent + 1 }))
      // Query aborts the signal when a newer term replaces this one
      signal.addEventListener('abort', () =>
        setRequests((count) => ({ ...count, cancelled: count.cancelled + 1 })),
      )
      return searchPosts(term, signal)
    },
    enabled: term.length > 0,
    // Keep showing the last results while the next term loads
    placeholderData: keepPreviousData,
  })

  const status =
    search !== debouncedSearch
      ? 'Typing...'
      : searchQuery.isFetching
        ? 'Searching...'
        : !term
          ? 'Type to search'
          : searchQuery.isError
            ? 'Search failed'
            : `Matches for "${term}": ${searchQuery.data?.length ?? 0}`

  return (
    <div
      className="App"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
    >
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
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Search posts{' '}
        <input
          value={search}
          onInput={(event) => setSearch(event.currentTarget.value)}
          placeholder="Try 'query' or 'data'"
        />
      </label>
      <p>{status}</p>
      <ul style={{ opacity: searchQuery.isPlaceholderData ? 0.5 : 1 }}>
        {term &&
          searchQuery.data?.map((post) => <li key={post.id}>{post.title}</li>)}
      </ul>
      <p>
        Requests sent: {requests.sent} | Cancelled: {requests.cancelled}
      </p>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
    },
  },
})

render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* Open the Pacer and Query panels as tabs to watch searches run */}
    <TanStackDevtools
      plugins={[
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        {
          name: 'TanStack Query',
          render: <PreactQueryDevtoolsPanel />,
          defaultOpen: true,
        },
      ]}
    />
  </QueryClientProvider>,
  document.getElementById('root')!,
)
