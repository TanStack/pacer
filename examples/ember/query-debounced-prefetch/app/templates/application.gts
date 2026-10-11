import { QueryClient, QueryObserver, onlineManager } from '@tanstack/query-core'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import type {
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/query-core'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedValue } from '@tanstack/ember-pacer'
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

/** Own a Query Core observer for one template invocation. */
class UseQuery<TData> extends Helper<{
  Args: { Positional: [options: QueryObserverOptions<TData>] }
  Return: { readonly current: QueryObserverResult<TData> }
}> {
  private observer?: QueryObserver<TData>
  private result?: { current: QueryObserverResult<TData> }
  private options?: QueryObserverOptions<TData>
  private unsubscribe?: () => void

  compute([options]: [QueryObserverOptions<TData>]) {
    this.options = options
    if (!this.observer) {
      this.observer = new QueryObserver(queryClient, options)
      this.result = trackedObject({ current: this.observer.getCurrentResult() })
      registerDestructor(this, () => {
        this.unsubscribe?.()
        this.observer?.destroy()
      })
    }
    // Fetches may notify synchronously. Subscribe after the template has rendered.
    scheduleOnce('afterRender', this, this.update)
    return this.result!
  }

  private update() {
    if (
      isDestroyed(this) ||
      isDestroying(this) ||
      !this.observer ||
      !this.options
    )
      return
    this.observer.setOptions(this.options)
    this.unsubscribe ??= this.observer.subscribe((current) => {
      this.result!.current = current
    })
  }
}

/** Prefetch a committed Pacer value after rendering, without changing template state. */
class Prefetch extends Helper<{
  Args: { Positional: [id: number | null] }
  Return: null
}> {
  private latest: number | null = null
  private previous: number | null = null
  compute([id]: [number | null]) {
    this.latest = id
    scheduleOnce('afterRender', this, this.update)
    return null
  }
  private update() {
    if (
      isDestroyed(this) ||
      isDestroying(this) ||
      this.latest === this.previous
    )
      return
    const id = this.latest
    this.previous = id
    if (id)
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
  }
}

const useQuery = UseQuery
const prefetch = Prefetch

class PostList extends Component<{
  Args: { onSelect: (id: number) => void }
}> {
  @tracked currentHoveredPostId: number | null = null
  postsOptions = { queryKey: ['posts'], queryFn: fetchPosts }
  hover = (id: number) => {
    this.currentHoveredPostId = id
  }

  <template>
    {{#let
      (useDebouncedValue this.currentHoveredPostId wait=100)
      as |scheduled|
    }}
      {{prefetch scheduled.value}}
      {{#let (useQuery this.postsOptions) as |posts|}}
        {{#if posts.current.isLoading}}
          <div>Loading posts...</div>
        {{else}}
          <div><h2>Posts</h2><ul style='margin: 0; padding: 0'>
              {{#each posts.current.data key='id' as |post|}}
                <li style='margin: 2px 0'><a
                    href='#post-{{post.id}}'
                    {{on 'mouseenter' (fn this.hover post.id)}}
                    {{on 'click' (fn @onSelect post.id)}}
                    style='display: block; padding: 4px; cursor: pointer'
                  >{{post.title}}</a></li>
              {{/each}}
            </ul></div>
        {{/if}}
      {{/let}}
    {{/let}}
  </template>
}

class PostDetail extends Component<{
  Args: { postId: number }
}> {
  get options() {
    const id = this.args.postId
    return { queryKey: ['post', id], queryFn: () => fetchPost(id) }
  }
  <template>
    {{#let (useQuery this.options) as |post|}}
      {{#if post.current.isLoading}}
        <div>Loading post...</div>
      {{else}}
        <div><h3>{{post.current.data.title}}</h3><p
          >{{post.current.data.body}}</p></div>
      {{/if}}
    {{/let}}
  </template>
}

export default class App extends Component {
  @tracked selectedPostId: number | null = null
  selectPost = (id: number) => {
    this.selectedPostId = id
  }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    queryClient.mount()
    registerDestructor(this, () => queryClient.unmount())
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanstackQueryDevtools({
      client: queryClient,
      onlineManager,
      queryFlavor: 'Query Core',
      version: '5',
      initialIsOpen: false,
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    <div class='App' style='max-width: 800px; margin: 0 auto; padding: 20px'>
      <h1>TanStack Pacer/Query Debounced Prefetch Example</h1>
      <p>Hover over a post title to prefetch its content</p>
      <p>This example shows how to prefetch a query when the user hovers over a
        post.</p>
      <p>The debounced query key is created after a debounce to avoid excessive
        prefetches.</p>
      <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px'>
        <PostList @onSelect={{this.selectPost}} />
        {{#if this.selectedPostId}}<PostDetail
            @postId={{this.selectedPostId}}
          />{{/if}}
      </div>
    </div>
  </template>
}
