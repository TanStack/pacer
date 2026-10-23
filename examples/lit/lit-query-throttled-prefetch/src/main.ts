import {
  QueryClient,
  QueryClientProvider,
  createQueryController,
  noop,
  onlineManager,
  queryOptions,
} from '@tanstack/lit-query'
import { LitElement, html, nothing } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { TanstackQueryDevtoolsPanel } from '@tanstack/query-devtools'
import { createThrottler } from '@tanstack/lit-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import type { TanStackDevtoolsPlugin } from '@tanstack/devtools'

interface Post {
  id: number
  title: string
  body: string
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

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

// Share one options object between the prefetch and the query controller so
// the key and fetcher can never drift apart
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

export class PostList extends LitElement {
  static properties = { onSelect: { attribute: false } }
  onSelect: (id: number) => void = () => {}
  private posts = createQueryController(this, postsQueryOptions)

  // Throttle the prefetch itself rather than a hovered-id property, so
  // hovering never re-renders the list. While the pointer moves, at most one
  // post is prefetched per window, and the last hovered post is always
  // prefetched on the trailing edge.
  private prefetcher = createThrottler(
    this,
    (postId: number) => {
      // `query` fetches only when the cached post is missing or stale. A
      // failed prefetch is ignored here; the post detail will retry and show
      // the error.
      queryClient.query(postQueryOptions(postId)).catch(noop)
    },
    {
      key: 'Post Prefetch Throttler', // identifies this throttler in the Pacer devtools
      wait: 100, // adjust this value to see the difference
    },
  )

  override createRenderRoot() {
    return this
  }

  override render() {
    const posts = this.posts()
    if (posts.isPending) return html`<div>Loading posts...</div>`
    if (posts.isError) return html`<div>Could not load posts.</div>`
    return html`<div>
      <h2>Posts</h2>
      <!-- Leaving the list cancels the pending trailing prefetch -->
      <ul
        style="margin: 0; padding: 0"
        @mouseleave=${() => this.prefetcher.cancel()}
      >
        ${posts.data.map(
          (post) =>
            html`<li style="margin: 2px 0">
              <a
                href=${`#post-${post.id}`}
                @mouseenter=${() => this.prefetcher.maybeExecute(post.id)}
                @click=${() => this.onSelect(post.id)}
                style="display: block; padding: 4px; cursor: pointer"
                >${post.title}</a
              >
            </li>`,
        )}
      </ul>
    </div>`
  }
}
customElements.define('pacer-post-list', PostList)

export class PostDetail extends LitElement {
  static properties = { postId: { type: Number } }
  postId = 0
  private post = createQueryController(this, () => ({
    ...postQueryOptions(this.postId),
    // The controller can run before Lit sets the post id
    enabled: this.postId > 0,
  }))

  override createRenderRoot() {
    return this
  }

  override render() {
    const post = this.post()
    if (post.isPending) return html`<div>Loading post...</div>`
    if (post.isError) return html`<div>Could not load post.</div>`
    return html`<div>
      <h3>${post.data.title}</h3>
      <p>${post.data.body}</p>
    </div>`
  }
}
customElements.define('pacer-post-detail', PostDetail)

// Mount the core Query panel into the TanStack Devtools plugin container
function queryDevtoolsPlugin(client: QueryClient): TanStackDevtoolsPlugin {
  let panel: TanstackQueryDevtoolsPanel | undefined
  return {
    name: 'TanStack Query',
    defaultOpen: true,
    render: (element, { theme }) => {
      if (!panel) {
        panel = new TanstackQueryDevtoolsPanel({
          client,
          queryFlavor: 'Lit Query',
          version: '5',
          onlineManager,
        })
        panel.mount(element)
      }
      panel.setTheme(theme)
    },
    destroy: () => {
      panel?.unmount()
      panel = undefined
    },
  }
}

class Example extends LitElement {
  static properties = { selectedPostId: { state: true } }
  selectedPostId: number | null = null
  selectPost = (id: number) => {
    this.selectedPostId = id
  }
  private devtools?: TanStackDevtoolsCore
  private target?: HTMLDivElement

  override createRenderRoot() {
    return this
  }

  override connectedCallback() {
    super.connectedCallback()
    if (!import.meta.env.DEV) return
    this.target = document.createElement('div')
    document.body.append(this.target)
    // Open the Pacer and Query panels as tabs to watch prefetches land
    this.devtools = new TanStackDevtoolsCore({
      plugins: [
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        queryDevtoolsPlugin(queryClient),
      ],
    })
    this.devtools.mount(this.target)
  }

  override disconnectedCallback() {
    this.devtools?.unmount()
    this.target?.remove()
    this.devtools = undefined
    this.target = undefined
    super.disconnectedCallback()
  }

  override render() {
    return html`<div
      class="App"
      style="max-width: 800px; margin: 0 auto; padding: 20px"
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
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
        <pacer-post-list .onSelect=${this.selectPost}></pacer-post-list>
        ${
          this.selectedPostId !== null
            ? html`<pacer-post-detail
                .postId=${this.selectedPostId}
              ></pacer-post-detail>`
            : nothing
        }
      </div>
    </div>`
  }
}
customElements.define('pacer-example', Example)
customElements.define('query-client-provider', QueryClientProvider)
const provider = new QueryClientProvider()
provider.client = queryClient
provider.append(document.createElement('pacer-example'))
document.getElementById('app')!.append(provider)
