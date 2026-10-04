import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { QueryObserver, onlineManager } from '@tanstack/query-core'
import { TanstackQueryDevtools } from '@tanstack/query-devtools'
import { fetchPosts, fetchPost, queryClient } from './api'
import type { QueryObserverResult } from '@tanstack/query-core'
import type { Post } from './api'

class Example {
  selectedPostId: number | null = null
  currentHoveredPostId: number | null = null
  posts?: QueryObserverResult<Array<Post>>
  post?: QueryObserverResult<Post>
  private cleanup = () => {}
  private updatePost = (_id: number) => {}

  init() {
    const scope = createPacerScope()
    queryClient.mount()
    // Keep Query observers outside Alpine's deep proxy; their callbacks update reactive results.
    const posts = new QueryObserver(queryClient, {
      queryKey: ['posts'],
      queryFn: fetchPosts,
    })
    const post = new QueryObserver<Post>(queryClient, {
      queryKey: ['post', null],
      enabled: false,
    })
    this.posts = posts.getCurrentResult()
    this.post = post.getCurrentResult()
    const unsubscribePosts = posts.subscribe((result) => {
      this.posts = result
    })
    const unsubscribePost = post.subscribe((result) => {
      this.post = result
    })
    this.updatePost = (id) =>
      post.setOptions({ queryKey: ['post', id], queryFn: () => fetchPost(id) })

    const [scheduledHoveredPostId] = scope.createThrottledValue(
      () => this.currentHoveredPostId,
      {
        wait: 100,
      },
    )
    const prefetchEffect = Alpine.effect(() => {
      const id = scheduledHoveredPostId()
      if (id)
        void queryClient.ensureQueryData({
          queryKey: ['post', id],
          queryFn: () => fetchPost(id),
        })
    })

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
    this.cleanup = () => {
      Alpine.release(prefetchEffect)
      scope.destroy()
      unsubscribePosts()
      unsubscribePost()
      posts.destroy()
      post.destroy()
      queryClient.unmount()
      devtools?.unmount()
      target?.remove()
    }
  }

  selectPost(id: number) {
    this.selectedPostId = id
    this.updatePost(id)
  }

  destroy() {
    this.cleanup()
  }
}
Alpine.data('app', () => new Example())
Alpine.start()
