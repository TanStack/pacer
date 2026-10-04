import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedState } from '@tanstack/ember-pacer'
import type {
  RateLimiterState,
  EmberRateLimitedState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = RateLimiterState

type Result = EmberRateLimitedState<Value, Selected>
const eq = (a: unknown, b: unknown) => a === b
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  alert = window.alert.bind(window)
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  increment = (result: Result) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    result.setValue(nextCount)
  }
  select = (state: Selected) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<Update, Selected>['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  getRemainingInWindow = (result: Result) => {
    this.alert(result.utility.getRemainingInWindow())
  }
  reset = (result: Result) => {
    this.alert(result.utility.reset())
  }
  <template>
    {{#let
      (useRateLimitedState
        this.instantCount
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |limitedCount setLimitedCount rateLimiter|
      }}<div><h1>TanStack Pacer useRateLimitedState Example 1</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType'
                value='fixed'
                checked={{eq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType'
                value='sliding'
                checked={{eq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><table><tbody><tr><td>Execution
                  Count:</td><td
                >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                  Count:</td><td
                >{{rateLimiter.state.rejectionCount}}</td></tr><tr><td>Instant
                  Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Rate
                  Limited Count:</td><td
                >{{limitedCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button><button
              {{on 'click' (fn this.getRemainingInWindow result)}}
            > Remaining in Window</button><button
              {{on 'click' (fn this.reset result)}}
            >Reset</button></div><pre style='margin-top: 20px'>{{json
              rateLimiter.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}
