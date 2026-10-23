import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
  noop,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useThrottler } from '@tanstack/react-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'

interface Post {
  id: number
  title: string
  body: string
}

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

// Share one options object between the prefetch and `useQuery` so the key and
// fetcher can never drift apart
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

function PostList({
  setSelectedPostId,
}: {
  setSelectedPostId: (id: number) => void
}) {
  const queryClient = useQueryClient()
  const { data: posts, isPending, isError } = useQuery(postsQueryOptions)

  // Throttle the prefetch itself rather than a hovered-id state value, so
  // hovering never re-renders the list. While the pointer moves, at most one
  // post is prefetched per window, and the last hovered post is always
  // prefetched on the trailing edge.
  const prefetcher = useThrottler(
    (postId: number) => {
      // `query` fetches only when the cached post is missing or stale. A failed
      // prefetch is ignored here; `PostDetail` will retry and show the error.
      queryClient.query(postQueryOptions(postId)).catch(noop)
    },
    {
      key: 'Post Prefetch Throttler', // identifies this throttler in the Pacer devtools
      wait: 100, // adjust this value to see the difference
    },
    // Alternative to prefetcher.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  if (isPending) return <div>Loading posts...</div>
  if (isError) return <div>Could not load posts.</div>

  return (
    <div>
      <h2>Posts</h2>
      {/* Leaving the list cancels the pending trailing prefetch */}
      <ul style={{ margin: 0, padding: 0 }} onMouseLeave={prefetcher.cancel}>
        {posts.map((post) => (
          <li key={post.id} style={{ margin: '2px 0' }}>
            <a
              href={`#post-${post.id}`}
              onMouseEnter={() => prefetcher.maybeExecute(post.id)}
              onClick={() => setSelectedPostId(post.id)}
              style={{ display: 'block', padding: '4px', cursor: 'pointer' }}
            >
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PostDetail({ postId }: { postId: number }) {
  const { data: post, isPending, isError } = useQuery(postQueryOptions(postId))

  if (isPending) return <div>Loading post...</div>
  if (isError) return <div>Could not load post.</div>

  return (
    <div>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  )
}

function App() {
  const [selectedPostId, setSelectedPostId] = React.useState<number | null>(
    null,
  )

  return (
    <div
      className="App"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
    >
      <h1>TanStack Pacer/Query Throttled Prefetch Example</h1>
      <p>Hover over a post title to prefetch its content</p>
      <p>
        The prefetch is throttled, so it runs at most once every 100ms while the
        pointer moves, plus once for the post you end on. Sweeping across the
        list warms some of the posts you pass over. Use the debounced example
        instead if you only want the post the pointer rests on.
      </p>
      <p>
        Prefetched posts stay fresh for 10 seconds. Hovering a post after that
        refreshes it in the background.
      </p>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        <PostList setSelectedPostId={setSelectedPostId} />
        {selectedPostId !== null && <PostDetail postId={selectedPostId} />}
      </div>
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* Open the Pacer and Query panels as tabs to watch prefetches land */}
    <TanStackDevtools
      plugins={[
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel />,
          defaultOpen: true,
        },
      ]}
    />
  </QueryClientProvider>,
)
