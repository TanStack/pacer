import { useLayoutEffect, useState } from 'octane'
import { QueryObserver } from '@tanstack/query-core'
import { fetchPost, queryClient } from './api'

export function PostDetail({ postId }: { postId: number }) {
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
