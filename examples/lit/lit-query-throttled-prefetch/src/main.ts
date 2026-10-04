import { LitElement, html, nothing } from 'lit'
import { QueryClientProvider, onlineManager } from '@tanstack/lit-query'
import { TanstackQueryDevtools } from '@tanstack/query-devtools'
import { queryClient } from './api'
import './PostList'
import './PostDetail'

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
      <h1>TanStack Pacer/Query Throttled Prefetch Example</h1>
      <p>Hover over a post title to prefetch its content</p>
      <p>
        This example shows how to prefetch a query when the user hovers over a
        post.
      </p>
      <p>
        The throttled query key is created after a throttle to avoid excessive
        prefetches.
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
