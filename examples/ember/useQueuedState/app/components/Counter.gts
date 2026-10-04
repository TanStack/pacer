import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedState } from '@tanstack/ember-pacer'
import type { EmberQueuer, QueuerState } from '@tanstack/ember-pacer'

type Value = Parameters<Counter['processItem']>[0]

type Selected = QueuerState<Value>
type Utility = EmberQueuer<Value, Selected>
type Result = Utility
const peek = (utility: Utility) => {
  void utility.state
  return utility.peekNextItem()
}
const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
const not = (value: unknown) => !value
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Counter extends Component {
  processItem = (item: number) => {
    console.log('processing item', item)
  }
  select = (state: Selected) => state
  initialItemsOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  addNumber = (result: Result) => {
    const nextNumber = result.state.items.length
      ? result.state.items[result.state.items.length - 1]! + 1
      : 1
    result.addItem(nextNumber)
  }
  execute = (result: Result) => {
    result.execute()
  }
  clear = (result: Result) => {
    result.clear()
  }
  reset = (result: Result) => {
    result.reset()
  }
  start = (result: Result) => {
    result.start()
  }
  stop = (result: Result) => {
    result.stop()
  }
  <template>
    {{#let
      (useQueuedState
        this.processItem
        this.select
        maxSize=25
        initialItems=this.initialItemsOption
        started=false
        wait=1000
      )
      as |result|
    }}{{#let
        result.state.items result.addItem result
        as |queueItems addItem queuer|
      }}<div><h1>TanStack Pacer useQueuedState Example 1</h1><div>Queue Size:
            {{queuer.state.size}}</div><div>Queue Max Size: {{25}}</div><div
          >Queue Full: {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue
            Peek:
            {{peek queuer}}</div><div>Queue Empty:
            {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
            {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
            {{queuer.state.status}}</div><div>Items Processed:
            {{queuer.state.executionCount}}</div><div>Queue Items:
            {{join queueItems ', '}}</div><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
          ><button
              {{on 'click' (fn this.addNumber result)}}
              disabled={{queuer.state.isFull}}
            > Add Number</button><button
              disabled={{queuer.state.isEmpty}}
              {{on 'click' (fn this.execute result)}}
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
