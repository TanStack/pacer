import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedCallback } from '@tanstack/ember-pacer'
import type { EmberDebouncerOptions } from '@tanstack/ember-pacer'

type Execute = Search['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Search extends Component {
  @tracked searchText = ''
  @tracked searchTextRef = ''
  @tracked debouncedSearchText = ''
  handleSearchChange = (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    utility(newValue)
  }
  execute = (value: typeof this.debouncedSearchText) => {
    this.debouncedSearchText = value
  }
  enabledOption: NonNullable<EmberDebouncerOptions<Execute>['enabled']> = () =>
    this.searchTextRef.length > 2
  <template>
    {{#let
      (useDebouncedCallback this.execute wait=500 enabled=this.enabledOption)
      as |debouncedSetSearch|
    }}<div><h1>TanStack Pacer useDebouncedCallback Example 2</h1><div><input
            type='search'
            value={{this.searchText}}
            {{on 'input' (fn this.handleSearchChange debouncedSetSearch)}}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>Debounced Search:</td><td
              >{{this.debouncedSearchText}}</td></tr></tbody></table></div>{{/let}}
  </template>
}
