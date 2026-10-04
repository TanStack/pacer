import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { rateLimit } from '@tanstack/ember-pacer'

const eq = (a: unknown, b: unknown) => a === b
export default class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked rateLimitedValue = 50
  rateLimitedSetValueWindow = this.windowType
  rateLimitedSetValueFunction = rateLimit(
    (value: typeof this.rateLimitedValue) => (this.rateLimitedValue = value),
    {
      limit: 30,
      window: 2000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )
  get rateLimitedSetValue() {
    if (this.rateLimitedSetValueWindow !== this.windowType) {
      this.rateLimitedSetValueWindow = this.windowType
      this.rateLimitedSetValueFunction = rateLimit(
        (value: typeof this.rateLimitedValue) =>
          (this.rateLimitedValue = value),
        {
          limit: 30,
          window: 2000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetValueFunction
  }
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.rateLimitedSetValue(newValue)
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    <div><h1>TanStack Pacer rateLimit Example 3</h1><div
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
          />Sliding Window</label></div><div style='margin-bottom: 20px'><label
        >Current Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.currentValue}}
            {{on 'input' this.handleRangeChange}}
            style='width: 100%'
          /><span>{{this.currentValue}}</span></label></div><div
        style='margin-bottom: 20px'
      ><label>Rate Limited Range (Readonly):<input
            type='range'
            min='0'
            max='100'
            value={{this.rateLimitedValue}}
            disabled
            style='width: 100%'
          /><span>{{this.rateLimitedValue}}</span></label></div><div
        style='color: #666; font-size: 0.9em'
      ><p>Rate limited to 30 updates per 2000ms window</p></div></div>
  </template>
}
