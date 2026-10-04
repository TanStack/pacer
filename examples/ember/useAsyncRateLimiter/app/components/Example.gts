import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncRateLimiter } from '@tanstack/ember-pacer'
import type {
  EmberAsyncRateLimiter,
  AsyncRateLimiterState,
  EmberAsyncRateLimiterOptions,
} from '@tanstack/ember-pacer'
interface SearchResult {
  id: number
  title: string
}
type Utility = EmberAsyncRateLimiter<
  (term: string) => Promise<void>,
  AsyncRateLimiterState<(term: string) => Promise<void>>
>
const eq = (a: unknown, b: unknown) => a === b
const gt = (a: number, b: number) => a > b
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
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
  }
  onSearchChange = async (utility: Utility, e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    await utility.maybeExecute(newTerm) // optionally await if you need to
  }
  select = (state: AsyncRateLimiterState<(term: string) => Promise<void>>) =>
    state
  onRejectOption: NonNullable<
    EmberAsyncRateLimiterOptions<
      (term: string) => Promise<void>,
      AsyncRateLimiterState<(term: string) => Promise<void>>
    >['onReject']
  > = (_args, rateLimiter) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  onErrorOption: NonNullable<
    EmberAsyncRateLimiterOptions<
      (term: string) => Promise<void>,
      AsyncRateLimiterState<(term: string) => Promise<void>>
    >['onError']
  > = (cause) => {
    // optional error handler
    console.error('Search failed:', cause)
    this.error = cause as Error
    this.results = []
  }
  cleanup = (utility: Utility) => {
    utility.abort()
    utility.reset()
  }
  setFixedWindow = () => {
    this.windowType = 'fixed'
  }
  setSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useAsyncRateLimiter
        this.handleSearch
        this.select
        key='useAsyncRateLimiter'
        windowType=this.windowType
        limit=3
        window=3000
        onReject=this.onRejectOption
        onError=this.onErrorOption
        onUnmount=this.cleanup
      )
      as |setSearchAsyncRateLimiter|
    }}<div><h1>TanStack Pacer useAsyncRateLimiter Example</h1><div
          style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
        ><label><input
              type='radio'
              name='windowType'
              value='fixed'
              checked={{eq this.windowType 'fixed'}}
              {{on 'input' this.setFixedWindow}}
            />Fixed Window</label><label><input
              type='radio'
              name='windowType'
              value='sliding'
              checked={{eq this.windowType 'sliding'}}
              {{on 'input' this.setSlidingWindow}}
            />Sliding Window</label></div><div><input
            autofocus
            type='search'
            value={{this.searchTerm}}
            {{on 'input' (fn this.onSearchChange setSearchAsyncRateLimiter)}}
            placeholder='Type to search...'
            style='width: 100%'
            autocomplete='new-password'
          /></div>{{#if this.error}}<div>Error:
            {{this.error.message}}</div>{{/if}}<div><table><tbody><tr><td>API
                  calls made:</td><td
                >{{setSearchAsyncRateLimiter.state.successCount}}</td></tr><tr
              ><td>Rejected calls:</td><td
                >{{setSearchAsyncRateLimiter.state.rejectionCount}}</td></tr><tr
              ><td>Is executing:</td><td>{{if
                    setSearchAsyncRateLimiter.state.isExecuting
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Results:</td><td>{{#if
                    (gt this.results.length 0)
                  }}<ul>{{#each this.results as |item index|}}<li
                        >{{item.title}}</li>{{/each}}</ul>{{else}}No results{{/if}}</td></tr></tbody></table></div><pre
          style='margin-top: 20px'
        >{{json setSearchAsyncRateLimiter.state}}</pre></div>{{/let}}
  </template>
}
