import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimiter } from '@tanstack/ember-pacer'
import type {
  EmberRateLimiter,
  RateLimiterState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Utility = EmberRateLimiter<(value: number) => void, RateLimiterState>
const remaining = (utility: Utility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const milliseconds = (utility: Utility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked currentValue = 50
  @tracked limitedValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (utility: Utility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    utility.maybeExecute(newValue)
  }
  execute = (value: number) => {
    this.limitedValue = value
  }
  select = (state: RateLimiterState) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<
      (value: number) => void,
      RateLimiterState
    >['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  <template>
    {{#let
      (useRateLimiter
        this.execute
        this.select
        key='range'
        limit=20
        window=2000
        onReject=this.onRejectOption
      )
      as |rateLimiter|
    }}<div><h1>TanStack Pacer useRateLimiter Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange rateLimiter)}}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Rate Limited Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.limitedValue}}
              disabled
              style='width: 100%'
            /><span>{{this.limitedValue}}</span></label></div><table><tbody><tr
            ><td>Execution Count:</td><td
              >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                Count:</td><td>{{rateLimiter.state.rejectionCount}}</td></tr><tr
            ><td>Remaining in Window:</td><td>{{remaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td>{{milliseconds
                  rateLimiter
                }}</td></tr><tr><td>Instant Executions:</td><td
              >{{this.instantExecutionCount}}</td></tr><tr><td>Saved Executions:</td><td
              >{{sub
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
        >{{json rateLimiter.state}}</pre></div>{{/let}}
  </template>
}
