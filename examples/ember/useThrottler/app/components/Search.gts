import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type {
  EmberThrottler,
  ThrottlerState,
  EmberThrottlerOptions,
} from '@tanstack/ember-pacer'

type Utility = EmberThrottler<
  (value: string) => void,
  ThrottlerState<(value: string) => void>
>
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Search extends Component {
  @tracked instantSearch = ''
  @tracked throttledSearch = ''
  handleSearchChange = (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearch = newValue
    utility.maybeExecute(newValue)
  }
  execute = (value: string) => {
    this.throttledSearch = value
  }
  select = (state: ThrottlerState<(value: string) => void>) => state
  enabledOption: NonNullable<
    EmberThrottlerOptions<
      (value: string) => void,
      ThrottlerState<(value: string) => void>
    >['enabled']
  > = () => this.instantSearch.length > 2
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler
        this.execute
        this.select
        key='search'
        wait=1000
        enabled=this.enabledOption
      )
      as |setSearchThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 2</h1><div><input
            autofocus
            type='search'
            value={{this.instantSearch}}
            {{on 'input' (fn this.handleSearchChange setSearchThrottler)}}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Execution Count:</td><td
              >{{setSearchThrottler.state.executionCount}}</td></tr><tr><td
              >Instant Search:</td><td>{{this.instantSearch}}</td></tr><tr><td
              >Throttled Search:</td><td
              >{{this.throttledSearch}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.flush setSearchThrottler)}}
          >Flush</button></div><pre style='margin-top: 20px'>{{json
            setSearchThrottler.state
          }}</pre></div>{{/let}}
  </template>
}
