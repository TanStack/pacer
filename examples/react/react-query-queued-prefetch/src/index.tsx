import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useQueuedValue } from '@tanstack/react-pacer'

// Fetch all posts
const fetchPosts = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return response.json()
}

// Fetch a single post
const fetchPost = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  )
  return response.json()
}

function PostList({
  setSelectedPostId,
}: {
  setSelectedPostId: (id: number) => void
}) {
  // Simple query that fetches all posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  // keep track of the hovered post id that could be prefetched
  const [currentHoveredPostId, setCurrentHoveredPostId] = React.useState<
    number | null
  >(null)

  const [queuedHoveredPostId] = useQueuedValue(currentHoveredPostId, {
    addItemsTo: 'front', // newest hovered link is top priority
    wait: 100, // adjust this value to see the difference
    expirationDuration: 500, // If a link was hovered over 500ms ago, and still hasn't been prefetched, remove it from the queue
    onExpire: (item) => {
      console.log('expired', item)
    },
  })

  useEffect(() => {
    if (queuedHoveredPostId) {
      // queue up the hovered post id to be processed in order
      queryClient.ensureQueryData({
        queryKey: ['post', queuedHoveredPostId],
        queryFn: () => fetchPost(queuedHoveredPostId),
      })
    }
  }, [queuedHoveredPostId])

  const handleMouseEnter = (postId: number) => {
    setCurrentHoveredPostId(postId) // update the hovered post id
  }

  if (isLoading) return <div>Loading posts...</div>

  return (
    <div>
      <h2>Posts</h2>
      <ul style={{ margin: 0, padding: 0 }}>
        {posts?.map((post: { id: number; title: string }) => (
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
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  if (isLoading) return <div>Loading post...</div>

  return (
    <div>
      <h3>{post?.title}</h3>
      <p>{post?.body}</p>
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
        This example shows how to queue up prefetch requests when the user
        hovers over a post, processing them in order with a delay between each.
      </p>
      <p>
        The queued query key is processed after a delay to avoid overwhelming
        the server with too many requests at once.
      </p>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        <PostList setSelectedPostId={setSelectedPostId} />
        {selectedPostId && <PostDetail postId={selectedPostId} />}
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
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
)
