import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { asyncThrottle } from '@tanstack/ember-pacer'

export default class Example extends Component {
  @tracked searchText = ''
  @tracked throttledSearchText = ''
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
  throttledSetSearch = asyncThrottle(
    async (value: string) => {
      try {
        this.loading = true
        this.throttledSearchText = value
        const results = await this.simulateSearch(value)
        this.searchResults = results
      } catch (err) {
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    {
      wait: 1000,
    },
  )
  updateSearch = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.throttledSetSearch(newValue)
  }
  <template>
    <div><h1>TanStack Pacer asyncThrottle Example</h1><div><input
          type='search'
          value={{this.searchText}}
          {{on 'input' this.updateSearch}}
          placeholder='Type to search...'
          style='width: 100%'
        />{{#if this.loading}}<div>Loading...</div>{{/if}}</div><table><tbody
        ><tr><td>Instant Search:</td><td>{{this.searchText}}</td></tr><tr><td
            >Throttled Search:</td><td
            >{{this.throttledSearchText}}</td></tr></tbody></table><div><h3
        >Search Results:</h3><ul>{{#each this.searchResults as |result i|}}<li
            >{{result}}</li>{{/each}}</ul></div></div>
  </template>
}
