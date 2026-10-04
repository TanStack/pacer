import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuer } from '@tanstack/ember-pacer'
import type { EmberQueuer, QueuerState } from '@tanstack/ember-pacer'

type Utility = EmberQueuer<number, QueuerState<number>>
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
  select = (state: QueuerState<number>) => state
  initialItemsOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  addNumber = (utility: Utility) => {
    const nextNumber = utility.state.items.length
      ? utility.state.items[utility.state.items.length - 1]! + 1
      : 1
    utility.addItem(nextNumber)
  }
  processNext = (utility: Utility) => {
    const item = utility.execute()
    console.log('getNextItem item', item)
  }
  clear = (utility: Utility) => {
    utility.clear()
  }
  reset = (utility: Utility) => {
    utility.reset()
  }
  start = (utility: Utility) => {
    utility.start()
  }
  stop = (utility: Utility) => {
    utility.stop()
  }
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useQueuer
        this.processItem
        this.select
        key='Add Number Queue'
        initialItems=this.initialItemsOption
        maxSize=25
        started=false
        wait=1000
      )
      as |queuer|
    }}<div><h1>TanStack Pacer useQueuer Example 1</h1><div>Queue Size:
          {{queuer.state.size}}</div><div>Queue Max Size: {{25}}</div><div>Queue
          Full:
          {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue Peek:
          {{peek queuer}}</div><div>Queue Empty:
          {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
          {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
          {{queuer.state.status}}</div><div>Items Processed:
          {{queuer.state.executionCount}}</div><div>Queue Items:
          {{join queuer.state.items ', '}}</div><div
          style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
        ><button
            {{on 'click' (fn this.addNumber queuer)}}
            disabled={{queuer.state.isFull}}
          > Add Number</button><button
            disabled={{queuer.state.isEmpty}}
            {{on 'click' (fn this.processNext queuer)}}
          > Process Next</button><button
            {{on 'click' (fn this.clear queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Clear Queue</button><button
            {{on 'click' (fn this.reset queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Reset Queue</button><button
            {{on 'click' (fn this.start queuer)}}
            disabled={{queuer.state.isRunning}}
          > Start Processing</button><button
            {{on 'click' (fn this.stop queuer)}}
            disabled={{not queuer.state.isRunning}}
          > Stop Processing</button><button
            {{on 'click' (fn this.flush queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Flush Queue </button></div><pre style='margin-top: 20px'>{{json
            queuer.state
          }}</pre></div>{{/let}}
  </template>
}
