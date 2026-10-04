import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedState } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncedState } from '@tanstack/ember-pacer'

type Value = Range['currentValue']
type Update = (value: Value | ((previous: Value) => Value)) => void
type Selected = DebouncerState<Update>

type Result = EmberDebouncedState<Value, Selected>
const string = (value: unknown) => String(value)
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked currentValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (result: Result, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    result.setValue(newValue)
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useDebouncedState this.currentValue this.select wait=250)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedValue setDebouncedValue debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 3</h1><div
            style='margin-bottom: 20px'
          ><label>Current Range:<input
                type='range'
                min='0'
                max='100'
                value={{this.currentValue}}
                {{on 'input' (fn this.handleRangeChange result)}}
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
                  }}</td></tr><tr><td>Instant Executions:</td><td
                >{{this.instantExecutionCount}}</td></tr><tr><td>Debounced
                  Executions:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.instantExecutionCount
                    debouncer.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (eq this.instantExecutionCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.instantExecutionCount
                            debouncer.state.executionCount
                          )
                          this.instantExecutionCount
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
