import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedValue } from '@tanstack/ember-pacer'
import type {
  EmberQueuer,
  QueuerState,
  EmberQueuedValue,
} from '@tanstack/ember-pacer'

type Value = Counter['instantSearchValue']

type Selected = QueuerState<Value>
type Utility = EmberQueuer<Value, Selected>
type Result = EmberQueuedValue<Value, Selected>
const peek = (utility: Utility) => {
  void utility.state
  return utility.peekNextItem()
}
const peekAll = (utility: Utility) => {
  void utility.state
  return utility.peekAllItems()
}
const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
const not = (value: unknown) => !value
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  @tracked instantSearchValue = ''
  select = (state: Selected) => state
  updateSearch = (result: Result, e: Event) => {
    this.instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search result.value
  }
  processNext = (result: Result) => {
    result.utility.execute()
  }
  clear = (result: Result) => {
    result.utility.clear()
  }
  reset = (result: Result) => {
    result.utility.reset()
  }
  start = (result: Result) => {
    result.utility.start()
  }
  stop = (result: Result) => {
    result.utility.stop()
  }
  <template>
    {{#let
      (useQueuedValue this.instantSearchValue this.select maxSize=25 wait=500)
      as |result|
    }}{{#let result.value result.utility as |value queuer|}}<div><h1>TanStack
            Pacer useQueuedValue Example 1</h1><div>Current Value:
            {{value}}</div><hr /><div>Queue Size:
            {{queuer.state.size}}</div><div>Queue Full:
            {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue Peek:
            {{peek queuer}}</div><div>Queue Empty:
            {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
            {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
            {{queuer.state.status}}</div><div>Items Processed:
            {{queuer.state.executionCount}}</div><div>Queue Items:
            {{join (peekAll queuer) ', '}}</div><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
          ><input
              type='search'
              value={{this.instantSearchValue}}
              {{on 'input' (fn this.updateSearch result)}}
              placeholder='Enter search term...'
              disabled={{queuer.state.isFull}}
            /><button
              disabled={{queuer.state.isEmpty}}
              {{on 'click' (fn this.processNext result)}}
            > Process Next</button><button
              {{on 'click' (fn this.clear result)}}
              disabled={{queuer.state.isEmpty}}
            > Clear Queue</button><button
              {{on 'click' (fn this.reset result)}}
              disabled={{queuer.state.isEmpty}}
            > Reset Queue</button><button
              {{on 'click' (fn this.start result)}}
              disabled={{queuer.state.isRunning}}
            > Start Processing</button><button
              {{on 'click' (fn this.stop result)}}
              disabled={{not queuer.state.isRunning}}
            > Stop Processing </button></div><pre
            style='margin-top: 20px'
          >{{json queuer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
