import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { debounce } from '@tanstack/ember-pacer'

export default class Search extends Component {
  @tracked searchText = ''
  @tracked debouncedSearchText = ''
  debouncedSetSearch = debounce(
    (value: typeof this.debouncedSearchText) =>
      (this.debouncedSearchText = value),
    {
      wait: 500,
    },
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  <template>
    <div><h1>TanStack Pacer debounce Example 2</h1><div><input
          type='search'
          value={{this.searchText}}
          {{on 'input' this.handleSearchChange}}
          placeholder='Type to search...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Instant Search:</td><td
            >{{this.searchText}}</td></tr><tr><td>Debounced Search:</td><td
            >{{this.debouncedSearchText}}</td></tr></tbody></table></div>
  </template>
}
