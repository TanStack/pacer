import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
interface SearchResult {
  id: number
  title: string
}
type Execute = Counter['execute']
type Utility = (...args: Parameters<Execute>) => unknown
const gt = (a: number, b: number) => a > b
export default class Counter extends Component {
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    if (term === 'error') {
      throw new Error('Simulated API error')
    }
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  @tracked searchTerm = ''
  @tracked results: Array<SearchResult> = []
  @tracked isLoading = false
  @tracked error: string | null = null
  handleSearchChange = async (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await utility(newValue)
    } catch (err) {
      // Error is already handled in the debounced function
      console.log('Search failed:', err)
    }
  }
  execute = async (term: string) => {
    if (!term.trim()) {
      this.results = []
      return []
    }
    this.isLoading = true
    this.error = null
    try {
      const data = await this.fakeApi(term)
      this.results = data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      this.error = errorMessage
      this.results = []
      throw err
    } finally {
      this.isLoading = false
    }
  }
  <template>
    {{#let (useAsyncDebouncer this.execute wait=500) as |debouncedSearch|}}<div
      ><h1>TanStack Pacer useAsyncDebouncer Example 1</h1><div><input
            type='search'
            value={{this.searchTerm}}
            {{on
              'input'
              (fn this.handleSearchChange debouncedSearch.maybeExecute)
            }}
            placeholder="Type to search... (try 'error' to see error handling)"
            style='width: 100%; margin-bottom: 10px'
          /></div>{{#if this.isLoading}}<p
            style='color: blue'
          >Searching...</p>{{/if}}{{#if this.error}}<p style='color: red'>Error:
            {{this.error}}</p>{{/if}}<div><p>Current search term:
            {{this.searchTerm}}</p>{{#if (gt this.results.length 0)}}<div><h3
              >Results:</h3><ul>{{#each this.results as |result index|}}<li
                  >{{result.title}}</li>{{/each}}</ul></div>{{/if}}</div></div>{{/let}}
  </template>
}
