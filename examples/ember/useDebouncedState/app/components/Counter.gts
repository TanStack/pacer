import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedState } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncedState } from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = DebouncerState<Update>

type Result = EmberDebouncedState<Value, Selected>
const string = (value: unknown) => String(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  increment = (result: Result) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    result.setValue(nextCount)
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useDebouncedState this.instantCount this.select wait=500)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedCount setDebouncedCount debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 1</h1><table><tbody
            ><tr><td>Is Pending:</td><td>{{string
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Execution Count:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td
                  colspan={{2}}
                ><hr /></td></tr><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
                >{{debouncedCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button></div><pre style='margin-top: 20px'>{{json
              debouncer.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}
