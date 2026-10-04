import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncThrottler } from '@tanstack/ember-pacer'
import type {
  EmberAsyncThrottler,
  AsyncThrottlerState,
  EmberAsyncThrottlerOptions,
} from '@tanstack/ember-pacer'
interface SearchResult {
  id: number
  title: string
}
type Utility = EmberAsyncThrottler<
  (term: string) => Promise<Array<SearchResult> | undefined>,
  AsyncThrottlerState<
    (term: string) => Promise<Array<SearchResult> | undefined>
  >
>
const gt = (a: number, b: number) => a > b
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  @tracked searchTerm = ''
  @tracked results: Array<SearchResult> = []
  @tracked error: Error | null = null
  handleSearch = async (term: string) => {
    if (!term) {
      this.results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await this.fakeApi(term)
    this.results = data
    this.error = null
    return data // this could alternatively be a void function without a return
  }
  onSearchChange = async (utility: Utility, e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    const result = await utility.maybeExecute(newTerm) // optionally await if you need to
    console.log('result', result)
  }
  select = (
    state: AsyncThrottlerState<
      (term: string) => Promise<Array<SearchResult> | undefined>
    >,
  ) => state
  onErrorOption: NonNullable<
    EmberAsyncThrottlerOptions<
      (term: string) => Promise<Array<SearchResult> | undefined>,
      AsyncThrottlerState<
        (term: string) => Promise<Array<SearchResult> | undefined>
      >
    >['onError']
  > = (cause) => {
    // optional error handler
    console.error('Search failed:', cause)
    this.error = cause as Error
    this.results = []
  }
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useAsyncThrottler
        this.handleSearch
        this.select
        key='useAsyncThrottler'
        wait=1000
        onError=this.onErrorOption
      )
      as |setSearchAsyncThrottler|
    }}<div><h1>TanStack Pacer useAsyncThrottler Example</h1><div><input
            autofocus
            type='search'
            value={{this.searchTerm}}
            {{on 'input' (fn this.onSearchChange setSearchAsyncThrottler)}}
            placeholder='Type to search...'
            style='width: 100%'
            autocomplete='new-password'
          /></div><div style='margin-top: 10px'><button
            {{on 'click' (fn this.flush setSearchAsyncThrottler)}}
          >Flush</button></div>{{#if this.error}}<div>Error:
            {{this.error.message}}</div>{{/if}}<div><p>API calls made:
            {{setSearchAsyncThrottler.state.successCount}}</p>{{#if
            (gt this.results.length 0)
          }}<ul>{{#each this.results as |item index|}}<li
                >{{item.title}}</li>{{/each}}</ul>{{/if}}{{#if
            setSearchAsyncThrottler.state.isPending
          }}<p>Pending...</p>{{else if
            setSearchAsyncThrottler.state.isExecuting
          }}<p>Executing...</p>{{else}}{{/if}}</div><pre
          style='margin-top: 20px'
        >{{json setSearchAsyncThrottler.state}}</pre></div>{{/let}}
  </template>
}
