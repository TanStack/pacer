import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked debouncedCount = 0
  execute = (value: number) => {
    this.debouncedCount = value
  }
  select = (state: DebouncerState<(value: number) => void>) => state
  canExecute = () => this.instantCount > 2
  increment = (
    debouncer: Pick<EmberDebouncer<(value: number) => void>, 'maybeExecute'>,
  ) => {
    this.instantCount++
    debouncer.maybeExecute(this.instantCount)
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='counter' wait=800 enabled=this.canExecute
      )
      as |debouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 1</h1><table><tbody><tr><td
              >Status:</td><td>{{debouncer.state.status}}</td></tr><tr><td
              >Execution Count:</td><td
              >{{debouncer.state.executionCount}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Count:</td><td
              >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
              >{{this.debouncedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment debouncer)}}
          >Increment</button><button
            {{on 'click' debouncer.flush}}
            style='margin-left: 10px'
          >Flush</button></div><pre style='margin-top: 20px'>{{json
            debouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}
