import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedCallback } from '@tanstack/ember-pacer'
import type { EmberRateLimiterOptions } from '@tanstack/ember-pacer'

type Execute = Range['execute']
type Utility = (...args: Parameters<Execute>) => unknown
const eq = (a: unknown, b: unknown) => a === b
export default class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked limitedValue = 50
  handleRangeChange = (utility: Utility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    utility(newValue)
  }
  execute = (value: typeof this.limitedValue) => {
    this.limitedValue = value
  }
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
      (useRateLimitedCallback
        this.execute
        limit=20
        window=2000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |rateLimitedSetValue|
    }}<div><h1>TanStack Pacer useRateLimitedCallback Example 3</h1><div
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
              {{on 'input' (fn this.handleRangeChange rateLimitedSetValue)}}
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
            /><span>{{this.limitedValue}}</span></label></div><div
          style='color: #666; font-size: 0.9em'
        ><p>Rate limited to 20 updates per 2 seconds</p></div></div>{{/let}}
  </template>
}
