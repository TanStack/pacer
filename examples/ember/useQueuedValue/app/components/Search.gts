import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useQueuedValue } from '@tanstack/ember-pacer'
import type { QueuerState } from '@tanstack/ember-pacer'

type Value = Search['currentValue']

type Selected = QueuerState<Value>

const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Search extends Component {
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
      (useQueuedValue this.currentValue this.select maxSize=100 wait=100)
      as |result|
    }}{{#let result.value result.utility as |queuedValue queuer|}}<div><h1
          >TanStack Pacer useQueuedValue Example 2</h1><div
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
          ><label>Queued Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{queuedValue}}
                disabled
                style='width: 100%'
              /><span>{{queuedValue}}</span></label></div><table><tbody><tr><td
                >Queue Size:</td><td>{{queuer.state.size}}</td></tr><tr><td
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
