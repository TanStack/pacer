import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type { EmberThrottlerOptions } from '@tanstack/ember-pacer'

type Execute = Search['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Search extends Component {
  @tracked searchText = ''
  @tracked searchTextRef = ''
  @tracked throttledSearchText = ''
  handleSearchChange = (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    utility(newValue)
  }
  execute = (value: typeof this.throttledSearchText) => {
    this.throttledSearchText = value
  }
  enabledOption: NonNullable<EmberThrottlerOptions<Execute>['enabled']> = () =>
    this.searchTextRef.length > 2
  <template>
    {{#let
      (useThrottler this.execute wait=1000 enabled=this.enabledOption)
      as |throttledSetSearch|
    }}<div><h1>TanStack Pacer useThrottler Example 2</h1><div><input
            type='search'
            value={{this.searchText}}
            {{on
              'input'
              (fn this.handleSearchChange throttledSetSearch.maybeExecute)
            }}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>Throttled Search:</td><td
              >{{this.throttledSearchText}}</td></tr></tbody></table></div>{{/let}}
  </template>
}
