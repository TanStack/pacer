import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimiter, rateLimiterOptions } from '@tanstack/ember-pacer'
import type {
  EmberRateLimiter,
  RateLimiterState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Utility = EmberRateLimiter<(value: number) => void, RateLimiterState>
const eq = (a: unknown, b: unknown) => a === b
const remaining = (utility: Utility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const milliseconds = (utility: Utility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked limitedCount = 0
  increment = (utility: Utility) => {
    const nextCount = ++this.instantCount
    utility.maybeExecute(nextCount)
  }
  execute = (value: number) => {
    this.limitedCount = value
  }
  select = (state: RateLimiterState) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<
      (value: number) => void,
      RateLimiterState
    >['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  setFixedWindow = () => {
    this.windowType = 'fixed'
  }
  setSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  reset = (utility: Utility) => {
    utility.reset()
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        this.select
        key='counter'
        limit=this.commonRateLimiterOptions.limit
        window=this.commonRateLimiterOptions.window
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |rateLimiter|
    }}<div><h1>TanStack Pacer useRateLimiter Example 1</h1><div
          style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
        ><label><input
              type='radio'
              name='windowType'
              value='fixed'
              checked={{eq this.windowType 'fixed'}}
              {{on 'input' this.setFixedWindow}}
            />Fixed Window</label><label><input
              type='radio'
              name='windowType'
              value='sliding'
              checked={{eq this.windowType 'sliding'}}
              {{on 'input' this.setSlidingWindow}}
            />Sliding Window</label></div><table><tbody><tr><td>Execution Count:</td><td
              >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                Count:</td><td>{{rateLimiter.state.rejectionCount}}</td></tr><tr
            ><td>Remaining in Window:</td><td>{{remaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td>{{milliseconds
                  rateLimiter
                }}</td></tr><tr><td colspan={{2}}><hr /></td></tr><tr><td
              >Instant Count:</td><td>{{this.instantCount}}</td></tr><tr><td
              >Rate Limited Count:</td><td
              >{{this.limitedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment rateLimiter)}}
          >Increment</button><button
            {{on 'click' (fn this.reset rateLimiter)}}
          >Reset</button></div><pre style='margin-top: 20px'>{{json
            rateLimiter.state
          }}</pre></div>{{/let}}
  </template>
}
