import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useThrottledValue } from '@tanstack/ember-pacer'
import type { ThrottlerState } from '@tanstack/ember-pacer'

type Value = Range['currentValue']
type Update = (value: Value) => void
type Selected = ThrottlerState<Update>

const sub = (a: number, b: number) => a - b
const gt = (a: number, b: number) => a > b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const fixed = (value: number, places: number) => value.toFixed(places)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked submittedCount = 1
  @tracked currentValue = 50
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useThrottledValue this.currentValue this.select wait=250)
      as |result|
    }}{{#let result.value result.utility as |throttledValue throttler|}}<div><h1
          >TanStack Pacer useThrottledValue Example 3</h1><div
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
                value={{throttledValue}}
                disabled
                style='width: 100%'
              /><span>{{throttledValue}}</span></label></div><table><tbody><tr
              ><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Throttled Execution
                  Count:</td><td>{{throttler.state.executionCount}}</td></tr><tr
              ><td>Saved Executions:</td><td>{{sub
                    this.submittedCount
                    throttler.state.executionCount
                  }}
                  ({{if
                    (gt this.submittedCount 0)
                    (fixed
                      (multiply
                        (divide
                          (sub
                            this.submittedCount throttler.state.executionCount
                          )
                          this.submittedCount
                        )
                        100
                      )
                      2
                    )
                    0
                  }}% Reduction in execution calls)
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Throttled to 1 update per 250ms</p></div><pre
            style='margin-top: 20px'
          >{{json throttler.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
