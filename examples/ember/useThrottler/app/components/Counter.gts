import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type { EmberThrottler, ThrottlerState } from '@tanstack/ember-pacer'

type Utility = EmberThrottler<
  (value: number) => void,
  ThrottlerState<(value: number) => void>
>
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked throttledCount = 0
  increment = (utility: Utility) => {
    const nextCount = ++this.instantCount
    utility.maybeExecute(nextCount)
  }
  execute = (value: number) => {
    this.throttledCount = value
  }
  select = (state: ThrottlerState<(value: number) => void>) => state
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler this.execute this.select key='counter' wait=1000)
      as |setCountThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 1</h1><table><tbody><tr><td
              >Execution Count:</td><td
              >{{setCountThrottler.state.executionCount}}</td></tr><tr><td
              >Instant Count:</td><td>{{this.instantCount}}</td></tr><tr><td
              >Throttled Count:</td><td
              >{{this.throttledCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment setCountThrottler)}}
          >Increment</button><button
            {{on 'click' (fn this.flush setCountThrottler)}}
            style='margin-left: 10px'
          > Flush </button></div><pre style='margin-top: 20px'>{{json
            setCountThrottler.state
          }}</pre></div>{{/let}}
  </template>
}
