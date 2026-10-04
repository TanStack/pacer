import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledValue } from '@tanstack/ember-pacer'
import { fetchPosts } from '../api'
import { useQuery } from '../helpers/useQuery'
import { prefetch } from '../helpers/prefetch'

export default class PostList extends Component<{
  Args: { onSelect: (id: number) => void }
}> {
  @tracked currentHoveredPostId: number | null = null
  postsOptions = { queryKey: ['posts'], queryFn: fetchPosts }
  hover = (id: number) => {
    this.currentHoveredPostId = id
  }

  <template>
    {{#let
      (useThrottledValue this.currentHoveredPostId wait=100)
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
