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
