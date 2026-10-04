import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledState } from '@tanstack/ember-pacer'
import type { ThrottlerState, EmberThrottledState } from '@tanstack/ember-pacer'

type Value = Search['instantSearch']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = ThrottlerState<Update>

type Result = EmberThrottledState<Value, Selected>
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Search extends Component {
  @tracked instantSearch = ''
  @tracked instantSearchRef = ''
  handleSearchChange = (result: Result, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    result.setValue(newValue)
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useThrottledState this.instantSearch this.select wait=1000)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |throttledSearch setThrottledSearch throttler|
      }}<div><h1>TanStack Pacer useThrottledState Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' (fn this.handleSearchChange result)}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Execution Count:</td><td
                >{{throttler.state.executionCount}}</td></tr><tr><td>Instant
                  Search:</td><td>{{this.instantSearch}}</td></tr><tr><td
                >Throttled Search:</td><td
                >{{throttledSearch}}</td></tr></tbody></table><pre
            style='margin-top: 20px'
          >{{json throttler.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
