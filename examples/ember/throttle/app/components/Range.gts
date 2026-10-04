import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { throttle } from '@tanstack/ember-pacer'

export default class Range extends Component {
  @tracked currentValue = 50
  @tracked throttledValue = 50
  @tracked instantExecutionCount = 0
  throttledSetValue = throttle(
    (value: typeof this.throttledValue) => (this.throttledValue = value),
    {
      wait: 250,
    },
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.throttledSetValue(newValue)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 3</h1><div
        style='margin-bottom: 20px'
      ><label>Current Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.currentValue}}
            {{on 'input' this.handleRangeChange}}
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
          /><span>{{this.throttledValue}}</span></label></div><table><tbody><tr
          ><td>Instant Executions:</td><td
            >{{this.instantExecutionCount}}</td></tr></tbody></table><div
        style='color: #666; font-size: 0.9em'
      ><p>Throttled with 250ms wait time</p></div></div>
  </template>
}
