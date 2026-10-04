import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedState } from '@tanstack/ember-pacer'
import type {
  DebouncerState,
  EmberDebouncedState,
  EmberDebouncerOptions,
} from '@tanstack/ember-pacer'

type Value = Search['instantSearch']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = DebouncerState<Update>

type Result = EmberDebouncedState<Value, Selected>
const string = (value: unknown) => String(value)
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
  enabledOption: NonNullable<
    EmberDebouncerOptions<Update, Selected>['enabled']
  > = () => this.instantSearchRef.length > 2
  <template>
    {{#let
      (useDebouncedState
        this.instantSearch this.select wait=500 enabled=this.enabledOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedSearch setDebouncedSearch debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' (fn this.handleSearchChange result)}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Is Pending:</td><td>{{string
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Execution Count:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td
                  colspan={{2}}
                ><hr /></td></tr><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Debounced Search:</td><td
                >{{debouncedSearch}}</td></tr></tbody></table><pre
            style='margin-top: 20px'
          >{{json debouncer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
