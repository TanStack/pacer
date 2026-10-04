import { createRoot, useLayoutEffect, useState } from 'octane'
import { onlineManager } from '@tanstack/query-core'
import { TanstackQueryDevtools } from '@tanstack/query-devtools'
import { queryClient } from './api'
import { PostList } from './PostList'
import { PostDetail } from './PostDetail'

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
      <h1>{'TanStack Pacer/Query Queued Prefetch Example'}</h1>
      <p>{'Hover over a post title to queue up its prefetch'}</p>
      <p>
        {
          'This example shows how to queue up prefetch requests when the user hovers over a post, processing them in order with a delay between each.'
        }
      </p>
      <p>
        {
          'The queued query key is processed after a delay to avoid overwhelming the server with too many requests at once.'
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
