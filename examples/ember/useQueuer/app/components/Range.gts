import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuer } from '@tanstack/ember-pacer'
import type { EmberQueuer, QueuerState } from '@tanstack/ember-pacer'

type Utility = EmberQueuer<number, QueuerState<number>>
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked currentValue = 50
  @tracked queuedValue = 50
  @tracked submittedCount = 1
  processItem = (item: number) => {
    this.queuedValue = item
  }
  handleRangeChange = (utility: Utility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    utility.addItem(newValue)
  }
  select = (state: QueuerState<number>) => state
  initialItemsOption = [this.currentValue]
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useQueuer
        this.processItem
        this.select
        key='Range Queue'
        maxSize=100
        initialItems=this.initialItemsOption
        wait=100
      )
      as |queuer|
    }}<div><h1>TanStack Pacer useQueuer Example 2</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange queuer)}}
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
                }}</td></tr><tr><td>Queuer Status:</td><td>{{if
                  queuer.state.isRunning
                  'Running'
                  'Stopped'
                }}</td></tr><tr><td>Values Submitted:</td><td
              >{{this.submittedCount}}</td></tr><tr><td>Items Processed:</td><td
              >{{queuer.state.executionCount}}</td></tr><tr><td>Pending Items:</td><td
              >{{queuer.state.size}}</td></tr></tbody></table><div
          style='color: #666; font-size: 0.9em'
        ><p>Queued with 100ms wait time</p></div><div><button
            {{on 'click' (fn this.flush queuer)}}
          >Flush Queue</button></div><pre style='margin-top: 20px'>{{json
            queuer.state
          }}</pre></div>{{/let}}
  </template>
}
