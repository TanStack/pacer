import { useLayoutEffect, useState } from 'octane'
import { QueryObserver } from '@tanstack/query-core'
import { useThrottledValue } from '@tanstack/octane-pacer'
import { fetchPosts, fetchPost, queryClient } from './api'

export function PostList({ onSelect }: { onSelect: (id: number) => void }) {
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
  const [scheduledHoveredPostId] = useThrottledValue(currentHoveredPostId, {
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
