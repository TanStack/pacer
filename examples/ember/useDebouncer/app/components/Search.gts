import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
const string = (value: unknown) => String(value)
export default class Search extends Component {
  @tracked searchText = ''
  @tracked debouncedSearchText = ''
  execute = (value: string) => {
    this.debouncedSearchText = value
  }
  select = (state: DebouncerState<(value: string) => void>) => state
  canExecute = () => this.searchText.length > 2
  handleSearchChange = (
    debouncer: Pick<EmberDebouncer<(value: string) => void>, 'maybeExecute'>,
    event: Event,
  ) => {
    this.searchText = (event.target as HTMLInputElement).value
    debouncer.maybeExecute(this.searchText)
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='search' wait=500 enabled=this.canExecute
      )
      as |setSearchDebouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 2</h1><div><input
            autofocus
            type='search'
            value={{this.searchText}}
            {{on 'input' (fn this.handleSearchChange setSearchDebouncer)}}
            placeholder='Type to search...'
            style='width: 100%; margin-bottom: 1rem'
          /></div><table><tbody><tr><td>Is Pending:</td><td>{{string
                  setSearchDebouncer.state.isPending
                }}</td></tr><tr><td>Execution Count:</td><td
              >{{setSearchDebouncer.state.executionCount}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>Debounced Search:</td><td
              >{{this.debouncedSearchText}}</td></tr></tbody></table><div
        ><button
            {{on 'click' setSearchDebouncer.flush}}
          >Flush</button></div><pre style='margin-top: 20px'>{{json
            setSearchDebouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}
