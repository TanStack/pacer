import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useRateLimitedValue } from '@tanstack/ember-pacer'
import type {
  RateLimiterState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value) => void
type Selected = RateLimiterState

const eq = (a: unknown, b: unknown) => a === b
export default class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
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
      (useRateLimitedValue
        this.instantCount
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let result.value as |limitedCount|}}<div><h1>TanStack Pacer
            useRateLimitedValue Example 1</h1><div
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
              />Sliding Window</label></div><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Rate Limited Count:</td><td
                >{{limitedCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}
