import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'

type Execute = Range['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Range extends Component {
  @tracked currentValue = 50
  @tracked throttledValue = 50
  handleRangeChange = (utility: Utility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    utility(newValue)
  }
  execute = (value: typeof this.throttledValue) => {
    this.throttledValue = value
  }
  <template>
    {{#let (useThrottler this.execute wait=250) as |throttledSetValue|}}<div><h1
        >TanStack Pacer useThrottler Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on
                'input'
                (fn this.handleRangeChange throttledSetValue.maybeExecute)
              }}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Throttled Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.throttledValue}}
              disabled
              style='width: 100%'
            /><span>{{this.throttledValue}}</span></label></div><div
          style='color: #666; font-size: 0.9em'
        ><p>Throttled to 1 update per 250ms</p></div></div>{{/let}}
  </template>
}
