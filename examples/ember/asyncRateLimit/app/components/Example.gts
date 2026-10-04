import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { asyncRateLimit } from '@tanstack/ember-pacer'

const eq = (a: unknown, b: unknown) => a === b
export default class Example extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked searchText = ''
  @tracked rateLimitedSearchText = ''
  @tracked searchResults: Array<string> = []
  @tracked loading = false
  simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }
  rateLimitedSetSearchWindow = this.windowType
  rateLimitedSetSearchFunction = asyncRateLimit(
    async (value: string) => {
      try {
        this.loading = true
        this.rateLimitedSearchText = value
        const results = await this.simulateSearch(value)
        this.searchResults = results
      } catch (err) {
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    {
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (_args, rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    },
  )
  get rateLimitedSetSearch() {
    if (this.rateLimitedSetSearchWindow !== this.windowType) {
      this.rateLimitedSetSearchWindow = this.windowType
      this.rateLimitedSetSearchFunction = asyncRateLimit(
        async (value: string) => {
          try {
            this.loading = true
            this.rateLimitedSearchText = value
            const results = await this.simulateSearch(value)
            this.searchResults = results
          } catch (err) {
            this.searchResults = []
          } finally {
            this.loading = false
          }
        },
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (_args, rateLimiter) => {
            console.log(
              `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
            )
          },
        },
      )
    }
    return this.rateLimitedSetSearchFunction
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  updateSearch = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.rateLimitedSetSearch(newValue)
  }
  <template>
    <div><h1>TanStack Pacer asyncRateLimit Example</h1><div
        style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
      ><label><input
            type='radio'
            name='windowType'
            value='fixed'
            checked={{eq this.windowType 'fixed'}}
            {{on 'input' this.useFixedWindow}}
          />Fixed Window</label><label><input
            type='radio'
            name='windowType'
            value='sliding'
            checked={{eq this.windowType 'sliding'}}
            {{on 'input' this.useSlidingWindow}}
          />Sliding Window</label></div><div><input
          type='search'
          value={{this.searchText}}
          {{on 'input' this.updateSearch}}
          placeholder='Type to search...'
          style='width: 100%'
        />{{#if this.loading}}<div>Loading...</div>{{/if}}</div><table><tbody
        ><tr><td>Instant Search:</td><td>{{this.searchText}}</td></tr><tr><td
            >Rate Limited Search:</td><td
            >{{this.rateLimitedSearchText}}</td></tr></tbody></table><div><h3
        >Search Results:</h3><ul>{{#each this.searchResults as |result i|}}<li
            >{{result}}</li>{{/each}}</ul></div></div>
  </template>
}
