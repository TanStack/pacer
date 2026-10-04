import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedState } from '@tanstack/ember-pacer'
import type { EmberQueuer, QueuerState } from '@tanstack/ember-pacer'

type Value = number

type Selected = QueuerState<Value>
type Utility = EmberQueuer<Value, Selected>
type Result = Utility
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Search extends Component {
  @tracked currentValue = 50
  @tracked queuedValue = 50
  @tracked submittedCount = 0
  handleRangeChange = (result: Result, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    result.addItem(newValue)
  }
  processItem = (item: number) => {
    this.queuedValue = item
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useQueuedState
        this.processItem this.select maxSize=100 started=true wait=100
      )
      as |result|
    }}{{#let result.addItem result as |addItem queuer|}}<div><h1>TanStack Pacer
            useQueuedState Example 2</h1><div style='margin-bottom: 20px'><label
            >Current Range:<input
                type='range'
                min='0'
                max='100'
                value={{this.currentValue}}
                {{on 'input' (fn this.handleRangeChange result)}}
                style='width: 100%'
              /><span>{{this.currentValue}}</span></label></div><div
            style='margin-bottom: 20px'
          ><label>Queued Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{this.queuedValue}}
                disabled
                style='width: 100%'
              /><span>{{this.queuedValue}}</span></label></div><table><tbody><tr
              ><td>Queue Size:</td><td>{{queuer.state.size}}</td></tr><tr><td
                >Queue Full:</td><td>{{if
                    queuer.state.isFull
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queue Empty:</td><td>{{if
                    queuer.state.isEmpty
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queue Idle:</td><td>{{if
                    queuer.state.isIdle
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queuer Status:</td><td
                >{{queuer.state.status}}</td></tr><tr><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Items Processed:</td><td
                >{{queuer.state.executionCount}}</td></tr><tr><td>Pending Items:</td><td
                >{{queuer.state.size}}</td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Queued with 100ms wait time</p></div><pre
            style='margin-top: 20px'
          >{{json queuer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
