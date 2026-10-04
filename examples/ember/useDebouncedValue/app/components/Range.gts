import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useDebouncedValue } from '@tanstack/ember-pacer'
import type { DebouncerState } from '@tanstack/ember-pacer'

type Value = Range['currentValue']
type Update = (value: Value) => void
type Selected = DebouncerState<Update>

const string = (value: unknown) => String(value)
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked currentValue = 50
  @tracked submittedCount = 1
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useDebouncedValue this.currentValue this.select wait=250)
      as |result|
    }}{{#let result.value result.utility as |debouncedValue debouncer|}}<div><h1
          >TanStack Pacer useDebouncedValue Example 3</h1><div
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
          ><label>Debounced Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{debouncedValue}}
                disabled
                style='width: 100%'
              /><span>{{debouncedValue}}</span></label></div><table><tbody><tr
              ><td>Is Pending:</td><td>{{string
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Debounced Executions:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.submittedCount
                    debouncer.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (eq this.submittedCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.submittedCount debouncer.state.executionCount
                          )
                          this.submittedCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Debounced to 250ms wait time</p></div><pre
            style='margin-top: 20px'
          >{{json debouncer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
