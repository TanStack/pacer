import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useAsyncQueuer } from '@tanstack/react-pacer'
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
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response
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

  // Each hovered post is queued, and the queue runs at most 2 prefetches at a
  // time so a fast sweep across the list can't flood the server.
  const prefetchQueuer = useAsyncQueuer(
    // `query` fetches only when the cached post is missing or stale, so cached
    // posts leave the queue immediately. The queuer catches a failed prefetch;
    // `PostDetail` will retry and show the error.
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
    // Alternative to prefetchQueuer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  const handleMouseEnter = (postId: number) => {
    // skip posts that are already waiting or being prefetched
    if (prefetchQueuer.peekAllItems().includes(postId)) return
    prefetchQueuer.addItem(postId)
  }

  if (isPending) return <div>Loading posts...</div>
  if (isError) return <div>Could not load posts.</div>

  return (
    <div>
      <h2>Posts</h2>
      {/* Only this line re-renders when the queue changes, not the whole list */}
      <prefetchQueuer.Subscribe
        selector={(state) => ({
          prefetching: state.activeItems,
          queued: state.items,
        })}
      >
        {({ prefetching, queued }) => (
          <p>
            Prefetching: {prefetching.join(', ') || 'none'} | Queued:{' '}
            {queued.join(', ') || 'none'}
          </p>
        )}
      </prefetchQueuer.Subscribe>
      <ul style={{ margin: 0, padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ margin: '2px 0' }}>
            <a
              href={`#post-${post.id}`}
              onMouseEnter={() => handleMouseEnter(post.id)}
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
