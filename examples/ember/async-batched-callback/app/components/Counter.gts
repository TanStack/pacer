import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type { EmberAsyncBatcherOptions } from '@tanstack/ember-pacer'
interface SearchResult {
  id: number
  title: string
  query: string
}
type Execute = Counter['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const eq = (a: unknown, b: unknown) => a === b
export default class Counter extends Component {
  batchedSearchApi = async (
    queries: Array<string>,
  ): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
    if (queries.some((q) => q === 'error')) {
      throw new Error('Simulated batch API error')
    }
    return queries.flatMap((query, index) => [
      { id: index * 10 + 1, title: `${query} result 1`, query },
      { id: index * 10 + 2, title: `${query} result 2`, query },
    ])
  }
  @tracked searchQueries: Array<string> = []
  @tracked results: Array<SearchResult> = []
  @tracked isLoading = false
  @tracked displayedError: string | null = null
  @tracked batchesProcessed = 0
  handleSearch = (utility: Utility, query: string) => {
    if (!query.trim()) return
    this.searchQueries = [...this.searchQueries, query]
    utility(query)
  }
  execute = async (queries: Array<string>) => {
    this.isLoading = true
    this.displayedError = null
    try {
      const data = await this.batchedSearchApi(queries)
      this.results = [...this.results, ...data]
      this.batchesProcessed = this.batchesProcessed + 1
      return data
    } finally {
      this.isLoading = false
    }
  }
  onErrorOption: NonNullable<
    EmberAsyncBatcherOptions<Parameters<Execute>[0][number]>['onError']
  > = (error) => {
    this.displayedError =
      error instanceof Error ? error.message : 'Unknown error'
  }
  searchJavascript = (utility: Utility) => {
    this.handleSearch(utility, 'javascript')
  }
  searchReact = (utility: Utility) => {
    this.handleSearch(utility, 'react')
  }
  searchTypescript = (utility: Utility) => {
    this.handleSearch(utility, 'typescript')
  }
  searchError = (utility: Utility) => {
    this.handleSearch(utility, 'error')
  }
  <template>
    {{#let
      (useAsyncBatcher
        this.execute
        maxSize=3
        wait=2000
        throwOnError=false
        onError=this.onErrorOption
      )
      as |batchedSearch|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 1</h1><div
          style='margin-bottom: 20px'
        ><button
            {{on 'click' (fn this.searchJavascript batchedSearch.addItem)}}
          >
            Search "javascript"</button><button
            {{on 'click' (fn this.searchReact batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "react"</button><button
            {{on 'click' (fn this.searchTypescript batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "typescript"</button><button
            {{on 'click' (fn this.searchError batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "error" (will fail) </button></div>{{#if this.isLoading}}<p
            style='color: blue'
          >Processing batch search...</p>{{/if}}{{#if this.displayedError}}<p
            style='color: red'
          >Error: {{this.displayedError}}</p>{{/if}}<table><tbody><tr><td>Total
                Searches Made:</td><td
              >{{this.searchQueries.length}}</td></tr><tr><td>Results Found:</td><td
              >{{this.results.length}}</td></tr><tr><td>Batches Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Search Results:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (eq this.results.length 0)}}<p style='color: #666'>No results
                yet...</p>{{else}}{{#each this.results as |result index|}}<div
                  style='margin-bottom: 5px; font-size: 0.9em'
                ><strong>{{result.query}}</strong>:
                  {{result.title}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Searches are batched - max 3 queries or 2 second wait time
        </p></div>{{/let}}
  </template>
}
