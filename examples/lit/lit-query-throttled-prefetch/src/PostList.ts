import { LitElement, html } from 'lit'
import { createQueryController } from '@tanstack/lit-query'
import { createThrottledValue } from '@tanstack/lit-pacer'
import { fetchPosts, fetchPost, queryClient } from './api'

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
  private scheduled = createThrottledValue(
    this,
    () => this.currentHoveredPostId,
    {
      wait: 100,
    },
  )
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
