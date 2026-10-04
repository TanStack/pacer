import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedState } from '@tanstack/ember-pacer'
import type {
  EmberRateLimiter,
  RateLimiterState,
  EmberRateLimitedState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Value = Range['currentValue']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = RateLimiterState
type Utility = EmberRateLimiter<Update, Selected>
type Result = EmberRateLimitedState<Value, Selected>
const eq = (a: unknown, b: unknown) => a === b
const remaining = (utility: Utility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const milliseconds = (utility: Utility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const sub = (a: number, b: number) => a - b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (result: Result, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    result.setValue(newValue)
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
  <template>
    {{#let
      (useRateLimitedState
        this.currentValue
        this.select
        limit=20
        window=2000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |limitedValue setLimitedValue rateLimiter|
      }}<div><h1>TanStack Pacer useRateLimitedState Example 3</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType3'
                value='fixed'
                checked={{eq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType3'
                value='sliding'
                checked={{eq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><div
            style='margin-bottom: 20px'
          ><label>Current Range:<input
                type='range'
                min='0'
                max='100'
                value={{this.currentValue}}
                {{on 'input' (fn this.handleRangeChange result)}}
                style='width: 100%'
              /><span>{{this.currentValue}}</span></label></div><div
            style='margin-bottom: 20px'
          ><label>Rate Limited Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{limitedValue}}
                disabled
                style='width: 100%'
              /><span>{{limitedValue}}</span></label></div><table><tbody><tr><td
                >Execution Count:</td><td
                >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                  Count:</td><td
                >{{rateLimiter.state.rejectionCount}}</td></tr><tr><td>Remaining
                  in Window:</td><td>{{remaining rateLimiter}}</td></tr><tr><td
                >Ms Until Next Window:</td><td>{{milliseconds
                    rateLimiter
                  }}</td></tr><tr><td>Instant Executions:</td><td
                >{{this.instantExecutionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.instantExecutionCount
                    rateLimiter.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (eq this.instantExecutionCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.instantExecutionCount
                            rateLimiter.state.executionCount
                          )
                          this.instantExecutionCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Rate limited to 20 updates per 2 seconds</p></div><pre
            style='margin-top: 20px'
          >{{json rateLimiter.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
