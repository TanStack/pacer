import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import type {
  EmberAsyncDebouncer,
  AsyncDebouncerState,
  EmberAsyncDebouncerOptions,
} from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

interface SearchResult {
  id: number
  title: string
}
type Utility = EmberAsyncDebouncer<
  (term: string) => Promise<Array<SearchResult> | undefined>,
  AsyncDebouncerState<
    (term: string) => Promise<Array<SearchResult> | undefined>
  >
>
const gt = (a: number, b: number) => a > b
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Example extends Component {
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  @tracked searchTerm = ''
  @tracked results: Array<SearchResult> = []
  handleSearch = async (term: string) => {
    if (!term) {
      this.results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await this.fakeApi(term)
    this.results = data
    return data // this could alternatively be a void function without a return
  }
  onSearchChange = async (utility: Utility, e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    const result = await utility.maybeExecute(newTerm) // optionally await result if you need to
    console.log('result', result)
  }
  select = (
    state: AsyncDebouncerState<
      (term: string) => Promise<Array<SearchResult> | undefined>
    >,
  ) => state
  onErrorOption: NonNullable<
    EmberAsyncDebouncerOptions<
      (term: string) => Promise<Array<SearchResult> | undefined>,
      AsyncDebouncerState<
        (term: string) => Promise<Array<SearchResult> | undefined>
      >
    >['onError']
  > = (error) => {
    // optional error handler
    console.error('Search failed:', error)
    this.results = []
  }
  asyncRetryerOptionsOption = {
    maxAttempts: 3,
    maxExecutionTime: 3000,
  }
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useAsyncDebouncer
        this.handleSearch
        this.select
        key='useAsyncDebouncer'
        wait=500
        onError=this.onErrorOption
        asyncRetryerOptions=this.asyncRetryerOptionsOption
      )
      as |asyncDebouncer|
    }}<div><h1>TanStack Pacer useAsyncDebouncer Example</h1><div><input
            autofocus
            type='search'
            value={{this.searchTerm}}
            {{on 'input' (fn this.onSearchChange asyncDebouncer)}}
            placeholder='Type to search...'
            style='width: 100%'
            autocomplete='new-password'
          /></div><div style='margin-top: 10px'><button
            {{on 'click' (fn this.flush asyncDebouncer)}}
          >Flush</button></div><div><p>API calls made:
            {{asyncDebouncer.state.successCount}}</p>{{#if
            (gt this.results.length 0)
          }}<ul>{{#each this.results as |item index|}}<li
                >{{item.title}}</li>{{/each}}</ul>{{/if}}{{#if
            asyncDebouncer.state.isPending
          }}<p>Pending...</p>{{/if}}{{#if asyncDebouncer.state.isExecuting}}<p
            >Executing...</p>{{/if}}</div><pre style='margin-top: 20px'>{{json
            asyncDebouncer.state
          }}</pre></div>{{/let}}
  </template>
}

export default class Application extends Component {
  @tracked mounted = true
  toggleMounted = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Enter') this.mounted = !this.mounted
  }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    document.addEventListener('keydown', this.toggleMounted)
    registerDestructor(this, () =>
      document.removeEventListener('keydown', this.toggleMounted),
    )
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    {{#if this.mounted}}<div><Example /></div>{{/if}}
  </template>
}
