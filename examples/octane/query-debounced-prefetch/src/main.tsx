import { QueryClient, QueryObserver, onlineManager } from '@tanstack/query-core'
import { useLayoutEffect, useState, createRoot } from 'octane'
import { useDebouncedValue } from '@tanstack/octane-pacer'
import { TanstackQueryDevtools } from '@tanstack/query-devtools'

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

function PostList({ onSelect }: { onSelect: (id: number) => void }) {
  const [observer] = useState(
    () =>
      new QueryObserver(queryClient, {
        queryKey: ['posts'],
        queryFn: fetchPosts,
      }),
  )
  const [posts, setPosts] = useState(() => observer.getCurrentResult())
  useLayoutEffect(() => {
    const unsubscribe = observer.subscribe(setPosts)
    return () => {
      unsubscribe()
      observer.destroy()
    }
  }, [observer])

  const [currentHoveredPostId, setCurrentHoveredPostId] = useState<
    number | null
  >(null)
  const [scheduledHoveredPostId] = useDebouncedValue(currentHoveredPostId, {
    wait: 100,
  })
  useLayoutEffect(() => {
    const id = scheduledHoveredPostId
    if (id)
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
  }, [scheduledHoveredPostId])

  return posts.isLoading ? (
    <div>{'Loading posts...'}</div>
  ) : (
    <div>
      <h2>{'Posts'}</h2>
      <ul style={{ margin: 0, padding: 0 }}>
        {posts.data?.map((post) => (
          <li key={post.id} style={{ margin: '2px 0' }}>
            <a
              href={`#post-${post.id}`}
              onMouseEnter={() => setCurrentHoveredPostId(post.id)}
              onClick={() => onSelect(post.id)}
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
  const [observer] = useState(
    () =>
      new QueryObserver(queryClient, {
        queryKey: ['post', postId],
        queryFn: () => fetchPost(postId),
      }),
  )
  const [post, setPost] = useState(() => observer.getCurrentResult())
  useLayoutEffect(() => {
    const unsubscribe = observer.subscribe(setPost)
    return () => {
      unsubscribe()
      observer.destroy()
    }
  }, [observer])
  useLayoutEffect(() => {
    observer.setOptions({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId),
    })
  }, [observer, postId])

  return post.isLoading ? (
    <div>{'Loading post...'}</div>
  ) : (
    <div>
      <h3>{post.data?.title}</h3>
      <p>{post.data?.body}</p>
    </div>
  )
}

function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  useLayoutEffect(() => {
    queryClient.mount()
    let devtools: TanstackQueryDevtools | undefined
    let target: HTMLDivElement | undefined
    if (import.meta.env.DEV) {
      target = document.createElement('div')
      document.body.append(target)
      devtools = new TanstackQueryDevtools({
        client: queryClient,
        onlineManager,
        queryFlavor: 'Query Core',
        version: '5',
        initialIsOpen: false,
      })
      devtools.mount(target)
    }
    return () => {
      queryClient.unmount()
      devtools?.unmount()
      target?.remove()
    }
  }, [])
  return (
    <div
      className="App"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
      <h1>{'TanStack Pacer/Query Debounced Prefetch Example'}</h1>
      <p>{'Hover over a post title to prefetch its content'}</p>
      <p>
        {
          'This example shows how to prefetch a query when the user hovers over a post.'
        }
      </p>
      <p>
        {
          'The debounced query key is created after a debounce to avoid excessive prefetches.'
        }
      </p>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        <PostList onSelect={setSelectedPostId} />
        {selectedPostId && <PostDetail postId={selectedPostId} />}
      </div>
    </div>
  )
}
createRoot(document.getElementById('app')!).render(App)
