import { LitElement, html } from 'lit'
import { createQueryController } from '@tanstack/lit-query'
import { fetchPost } from './api'

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
