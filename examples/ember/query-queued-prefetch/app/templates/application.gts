import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { onlineManager } from '@tanstack/query-core'
import { TanstackQueryDevtools } from '@tanstack/query-devtools'
import { queryClient } from '../api'
import PostList from '../components/PostList'
import PostDetail from '../components/PostDetail'

export default class Example extends Component {
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
      <h1>TanStack Pacer/Query Queued Prefetch Example</h1>
      <p>Hover over a post title to queue up its prefetch</p>
      <p>This example shows how to queue up prefetch requests when the user
        hovers over a post, processing them in order with a delay between each.</p>
      <p>The queued query key is processed after a delay to avoid overwhelming
        the server with too many requests at once.</p>
      <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px'>
        <PostList @onSelect={{this.selectPost}} />
        {{#if this.selectedPostId}}<PostDetail
            @postId={{this.selectedPostId}}
          />{{/if}}
      </div>
    </div>
  </template>
}
