import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useDebouncedValue } from '@tanstack/ember-pacer'
import type { DebouncerState } from '@tanstack/ember-pacer'

type Value = Search['instantSearch']
type Update = (value: Value) => void
type Selected = DebouncerState<Update>

export default class Search extends Component {
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  select = (state: Selected) => state
  get enabledOption() {
    return this.instantSearch.length > 2
  }
  <template>
    {{#let
      (useDebouncedValue
        this.instantSearch this.select wait=500 enabled=this.enabledOption
      )
      as |result|
    }}{{#let result.value as |debouncedSearch|}}<div><h1>TanStack Pacer
            useDebouncedValue Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Debounced Search:</td><td
                >{{debouncedSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}
