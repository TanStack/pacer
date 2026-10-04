import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { rateLimit } from '@tanstack/ember-pacer'

const eq = (a: unknown, b: unknown) => a === b
export default class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked rateLimitedCount = 0
  rateLimitedSetCountWindow = this.windowType
  rateLimitedSetCountFunction = rateLimit(
    (value: typeof this.rateLimitedCount) => (this.rateLimitedCount = value),
    {
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )
  get rateLimitedSetCount() {
    if (this.rateLimitedSetCountWindow !== this.windowType) {
      this.rateLimitedSetCountWindow = this.windowType
      this.rateLimitedSetCountFunction = rateLimit(
        (value: typeof this.rateLimitedCount) =>
          (this.rateLimitedCount = value),
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetCountFunction
  }
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    <div><h1>TanStack Pacer rateLimit Example 1</h1><div
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
            >{{this.rateLimitedCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}
