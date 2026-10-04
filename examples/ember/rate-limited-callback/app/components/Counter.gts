import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimiter } from '@tanstack/ember-pacer'
import type { EmberRateLimiterOptions } from '@tanstack/ember-pacer'

type Execute = Counter['execute']
type Utility = (...args: Parameters<Execute>) => unknown
const eq = (a: unknown, b: unknown) => a === b
export default class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  @tracked rateLimitedCount = 0
  increment = (utility: Utility) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    utility(nextCount)
  }
  execute = (value: typeof this.rateLimitedCount) => {
    this.rateLimitedCount = value
  }
  enabledOption: NonNullable<EmberRateLimiterOptions<Execute>['enabled']> =
    () => this.instantCountRef > 2
  onRejectOption: NonNullable<EmberRateLimiterOptions<Execute>['onReject']> = (
    rateLimiter,
  ) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        limit=5
        window=5000
        windowType=this.windowType
        enabled=this.enabledOption
        onReject=this.onRejectOption
      )
      as |rateLimitedSetCount|
    }}<div><h1>TanStack Pacer useRateLimiter Example 1</h1><div
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
              >{{this.instantCount}}</td></tr><tr><td>RateLimited Count:</td><td
              >{{this.rateLimitedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment rateLimitedSetCount.maybeExecute)}}
          >Increment</button></div></div>{{/let}}
  </template>
}
