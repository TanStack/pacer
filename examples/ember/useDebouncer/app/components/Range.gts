import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
const string = (value: unknown) => String(value)
const subtract = (a: number, b: number) => a - b
const reduction = (instant: number, executed: number) =>
  instant === 0 ? 0 : Math.round(((instant - executed) / instant) * 100)
export default class Range extends Component {
  @tracked currentValue = 50
  @tracked debouncedValue = 50
  @tracked instantExecutionCount = 0
  @tracked wait = 250
  @tracked enabled = true
  execute = (value: number) => {
    this.debouncedValue = value
  }
  select = (state: DebouncerState<(value: number) => void>) => state
  handleRangeChange = (
    debouncer: Pick<EmberDebouncer<(value: number) => void>, 'maybeExecute'>,
    event: Event,
  ) => {
    this.currentValue = Number((event.target as HTMLInputElement).value)
    this.instantExecutionCount++
    debouncer.maybeExecute(this.currentValue)
  }
  updateWait = (event: Event) => {
    this.wait = (event.target as HTMLInputElement).valueAsNumber
  }
  updateEnabled = (event: Event) => {
    this.enabled = (event.target as HTMLInputElement).checked
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='range' wait=this.wait enabled=this.enabled
      )
      as |setValueDebouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 3</h1><fieldset><legend
          >Reactive options</legend><label>Delay:
            {{this.wait}}
            ms<input
              type='range'
              min='0'
              max='1500'
              step='50'
              value={{this.wait}}
              {{on 'input' this.updateWait}}
            /></label><label><input
              type='checkbox'
              checked={{this.enabled}}
              {{on 'input' this.updateEnabled}}
            />Enabled</label><p>Changing the delay affects the next scheduled
            call. Disabling cancels pending work.</p></fieldset><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange setValueDebouncer)}}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Debounced Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.debouncedValue}}
              disabled
              style='width: 100%'
            /><span>{{this.debouncedValue}}</span></label></div><table><tbody
          ><tr><td>Is Pending:</td><td>{{string
                  setValueDebouncer.state.isPending
                }}</td></tr><tr><td>Instant Executions:</td><td
              >{{this.instantExecutionCount}}</td></tr><tr><td>Debounced
                Executions:</td><td
              >{{setValueDebouncer.state.executionCount}}</td></tr><tr><td>Saved
                Executions:</td><td>{{subtract
                  this.instantExecutionCount
                  setValueDebouncer.state.executionCount
                }}</td></tr><tr><td>% Reduction:</td><td>{{reduction
                  this.instantExecutionCount
                  setValueDebouncer.state.executionCount
                }}%</td></tr></tbody></table><div
          style='color: #666; font-size: 0.9em'
        ><p>Debounced to {{this.wait}}ms wait time</p></div><div><button
            {{on 'click' setValueDebouncer.flush}}
          >Flush</button></div><pre style='margin-top: 20px'>{{json
            setValueDebouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}
