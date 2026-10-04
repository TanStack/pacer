import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledState } from '@tanstack/ember-pacer'
import type { ThrottlerState, EmberThrottledState } from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = ThrottlerState<Update>

type Result = EmberThrottledState<Value, Selected>
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
      (useThrottledState this.instantCount this.select wait=1000)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |throttledCount setThrottledCount throttler|
      }}<div><h1>TanStack Pacer useThrottledState Example 1</h1><table><tbody
            ><tr><td>Execution Count:</td><td
                >{{throttler.state.executionCount}}</td></tr><tr><td>Instant
                  Count:</td><td>{{this.instantCount}}</td></tr><tr><td
                >Throttled Count:</td><td
                >{{throttledCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button></div><pre style='margin-top: 20px'>{{json
              throttler.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}
