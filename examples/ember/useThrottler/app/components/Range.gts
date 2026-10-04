import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type { EmberThrottler, ThrottlerState } from '@tanstack/ember-pacer'

type Utility = EmberThrottler<
  (value: number) => void,
  ThrottlerState<(value: number) => void>
>
const sub = (a: number, b: number) => a - b
const gt = (a: number, b: number) => a > b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const fixed = (value: number, places: number) => value.toFixed(places)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked instantExecutionCount = 0
  @tracked currentValue = 50
  @tracked throttledValue = 50
  handleRangeChange = (utility: Utility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    // instant state update
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // throttled state update
    utility.maybeExecute(newValue)
  }
  execute = (value: number) => {
    this.throttledValue = value
  }
  select = (state: ThrottlerState<(value: number) => void>) => state
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler this.execute this.select key='range' wait=250)
      as |setValueThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange setValueThrottler)}}
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
            /><span>{{this.throttledValue}}</span></label></div><table><tbody
          ><tr><td>Instant Execution Count:</td><td
              >{{this.instantExecutionCount}}</td></tr><tr><td>Throttled
                Execution Count:</td><td
              >{{setValueThrottler.state.executionCount}}</td></tr><tr><td>Saved
                Executions:</td><td>{{sub
                  this.instantExecutionCount
                  setValueThrottler.state.executionCount
                }}
                ({{if
                  (gt this.instantExecutionCount 0)
                  (fixed
                    (multiply
                      (divide
                        (sub
                          this.instantExecutionCount
                          setValueThrottler.state.executionCount
                        )
                        this.instantExecutionCount
                      )
                      100
                    )
                    2
                  )
                  0
                }}% Reduction in execution calls)
              </td></tr></tbody></table><div
          style='color: #666; font-size: 0.9em'
        ><p>Throttled to 1 update per 250ms (trailing edge)</p></div><div
        ><button
            {{on 'click' (fn this.flush setValueThrottler)}}
          >Flush</button></div><pre style='margin-top: 20px'>{{json
            setValueThrottler.state
          }}</pre></div>{{/let}}
  </template>
}
