import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncQueuer } from '@tanstack/ember-pacer'
import type {
  EmberAsyncQueuer,
  AsyncQueuerState,
  EmberAsyncQueuerOptions,
} from '@tanstack/ember-pacer'
type Item = number
type Utility = EmberAsyncQueuer<number, AsyncQueuerState<number>>
const space = ' '
const peekAll = (utility: Utility) => {
  void utility.state
  return utility.peekAllItems()
}
const not = (value: unknown) => !value
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  fakeWaitTime = 500
  @tracked concurrency = 2
  processItem = async (item: Item): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, this.fakeWaitTime))
    console.log(`Processed ${item}`)
  }
  select = (state: AsyncQueuerState<number>) => state
  initialItemsOption = Array.from({ length: 10 }, (_, i) => i + 1)
  onRejectOption: NonNullable<
    EmberAsyncQueuerOptions<number, AsyncQueuerState<number>>['onReject']
  > = (item, asyncQueuer) => {
    console.log(
      'Queue is full, rejecting item',
      item,
      asyncQueuer.store.state.rejectionCount,
    )
  }
  onErrorOption: NonNullable<
    EmberAsyncQueuerOptions<number, AsyncQueuerState<number>>['onError']
  > = (error, item: Item, asyncQueuer) => {
    console.error(
      `Error processing item: ${item}`,
      error,
      asyncQueuer.store.state.errorCount,
    ) // optionally, handle errors here instead of your own try/catch
  }
  updateConcurrency = (e: Event) => {
    this.concurrency = Math.max(
      1,
      parseInt((e.target as HTMLInputElement).value) || 1,
    )
  }
  addNumber = (utility: Utility) => {
    const nextNumber = utility.peekAllItems().length
      ? Math.max(...utility.peekAllItems()) + 1
      : 1
    utility.addItem(nextNumber)
  }
  getNextItem = (utility: Utility) => {
    utility.getNextItem()
  }
  clear = (utility: Utility) => {
    utility.clear()
  }
  flush = (utility: Utility) => {
    utility.flush()
  }
  start = (utility: Utility) => {
    utility.start()
  }
  stop = (utility: Utility) => {
    utility.stop()
  }
  reset = (utility: Utility) => {
    utility.reset()
  }
  <template>
    {{#let
      (useAsyncQueuer
        this.processItem
        this.select
        key='useAsyncQueuer'
        maxSize=25
        initialItems=this.initialItemsOption
        concurrency=this.concurrency
        started=false
        wait=100
        onReject=this.onRejectOption
        onError=this.onErrorOption
      )
      as |asyncQueuer|
    }}<div><h1>TanStack Pacer useAsyncQueuer Example</h1><div></div><div>Queue
          Size:
          {{asyncQueuer.state.size}}</div><div>Queue Max Size: {{25}}</div><div
        >Queue Full: {{if asyncQueuer.state.isFull 'Yes' 'No'}}</div><div>Queue
          Empty:
          {{if asyncQueuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
          {{if asyncQueuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
          {{asyncQueuer.state.status}}</div><div>Items Processed:
          {{asyncQueuer.state.successCount}}</div><div>Items Rejected:
          {{asyncQueuer.state.rejectionCount}}</div><div>Active Tasks:
          {{asyncQueuer.state.activeItems.length}}</div><div>Pending Tasks:
          {{asyncQueuer.state.items.length}}</div><div>
          Concurrency:{{space}}<input
            type='number'
            min={{1}}
            value={{this.concurrency}}
            {{on 'input' this.updateConcurrency}}
            style='width: 60px'
          /></div><div style='min-height: 250px'>
          Queue Items:{{#each (peekAll asyncQueuer) as |item index|}}<div
            >{{index}}: {{item}}</div>{{/each}}</div><div
          style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
        ><button
            {{on 'click' (fn this.addNumber asyncQueuer)}}
            disabled={{asyncQueuer.state.isFull}}
          > Add Async Task</button><button
            {{on 'click' (fn this.getNextItem asyncQueuer)}}
          >Get Next Item</button><button
            {{on 'click' (fn this.clear asyncQueuer)}}
            disabled={{asyncQueuer.state.isEmpty}}
          > Clear Queue</button><button
            {{on 'click' (fn this.flush asyncQueuer)}}
            disabled={{asyncQueuer.state.isEmpty}}
          > Flush Queue</button><button
            {{on 'click' (fn this.start asyncQueuer)}}
            disabled={{asyncQueuer.state.isRunning}}
          > Start Processing</button><button
            {{on 'click' (fn this.stop asyncQueuer)}}
            disabled={{not asyncQueuer.state.isRunning}}
          > Stop Processing</button><button
            {{on 'click' (fn this.reset asyncQueuer)}}
          >Reset Queue</button></div><pre style='margin-top: 20px'>{{json
            asyncQueuer.state
          }}</pre></div>{{/let}}
  </template>
}
