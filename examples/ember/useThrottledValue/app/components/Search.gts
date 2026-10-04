import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useThrottledValue } from '@tanstack/ember-pacer'
import type { ThrottlerState } from '@tanstack/ember-pacer'

type Value = Search['instantSearch']
type Update = (value: Value) => void
type Selected = ThrottlerState<Update>

export default class Search extends Component {
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useThrottledValue this.instantSearch this.select wait=1000)
      as |result|
    }}{{#let result.value as |throttledSearch|}}<div><h1>TanStack Pacer
            useThrottledValue Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Throttled Search:</td><td
                >{{throttledSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}
