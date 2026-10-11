import {
  QueryClient,
  createQueryController,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/lit-query'
import { LitElement, html, nothing } from 'lit'
import { createQueuedValue } from '@tanstack/lit-pacer'
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
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response.
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  )
  return response.json()
}

export class PostList extends LitElement {
  static properties = {
    currentHoveredPostId: { state: true },
    onSelect: { attribute: false },
  }
  onSelect: (id: number) => void = () => {}
  currentHoveredPostId: number | null = null
  private posts = createQueryController(this, {
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
  private scheduled = createQueuedValue(this, () => this.currentHoveredPostId, {
    addItemsTo: 'front', // Newest hovered link is top priority.
    wait: 100,
    expirationDuration: 500, // Drop links that have waited too long to be prefetched.
    onExpire: (item) => console.log('expired', item),
  })
  private previousHoveredPostId: number | null = null

  override createRenderRoot() {
    return this
  }

  override updated() {
    // Prefetch when Pacer commits the hovered post id.
    const id = this.scheduled[0]()
    if (id && id !== this.previousHoveredPostId) {
      this.previousHoveredPostId = id
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
    }
  }

  override render() {
    const posts = this.posts()
    if (posts.isLoading) return html`<div>Loading posts...</div>`
    return html`<div>
      <h2>Posts</h2>
      <ul style="margin: 0; padding: 0">
        ${posts.data?.map(
          (post) =>
            html`<li style="margin: 2px 0">
              <a
                href=${`#post-${post.id}`}
                @mouseenter=${() => (this.currentHoveredPostId = post.id)}
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
    queryKey: ['post', this.postId],
    queryFn: () => fetchPost(this.postId),
    enabled: this.postId > 0,
  }))
  override createRenderRoot() {
    return this
  }
  override render() {
    const post = this.post()
    if (post.isLoading) return html`<div>Loading post...</div>`
    return html`<div>
      <h3>${post.data?.title}</h3>
      <p>${post.data?.body}</p>
    </div>`
  }
}
customElements.define('pacer-post-detail', PostDetail)

class Example extends LitElement {
  static properties = { selectedPostId: { state: true } }
  selectedPostId: number | null = null
  selectPost = (id: number) => {
    this.selectedPostId = id
  }
  private devtools?: TanstackQueryDevtools
  private target?: HTMLDivElement
  override createRenderRoot() {
    return this
  }
  override connectedCallback() {
    super.connectedCallback()
    if (!import.meta.env.DEV) return
    this.target = document.createElement('div')
    document.body.append(this.target)
    this.devtools = new TanstackQueryDevtools({
      client: queryClient,
      onlineManager,
      queryFlavor: 'Lit Query',
      version: '5',
      initialIsOpen: false,
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
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
        <pacer-post-list .onSelect=${this.selectPost}></pacer-post-list>
        ${this.selectedPostId ? html`<pacer-post-detail .postId=${this.selectedPostId}></pacer-post-detail>` : nothing}
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
