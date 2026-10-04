import Component from '@glimmer/component'
import { fetchPost } from '../api'
import { useQuery } from '../helpers/useQuery'

export default class PostDetail extends Component<{
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
