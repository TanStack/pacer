import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncQueuedState } from '@tanstack/ember-pacer'
import type {
  EmberAsyncQueuer,
  AsyncQueuerState,
  EmberAsyncQueuerOptions,
} from '@tanstack/ember-pacer'
type Item = number
type Value = Parameters<Example['processItem']>[0]

type Selected = AsyncQueuerState<Value>
type Utility = EmberAsyncQueuer<Value, Selected>
type Result = Utility
const space = ' '
const not = (value: unknown) => !value
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  fakeWaitTime = 500
  @tracked concurrency = 2
  processItem = async (item: Item): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, this.fakeWaitTime))
    console.log(`Processed ${item}`)
  }
  select = (state: Selected) => state
  initialItemsOption = Array.from({ length: 10 }, (_, i) => i + 1)
  onRejectOption: NonNullable<
    EmberAsyncQueuerOptions<Value, Selected>['onReject']
  > = (item: Item, asyncQueuer) => {
    console.log(
      'Queue is full, rejecting item',
      item,
      asyncQueuer.store.state.rejectionCount,
    )
  }
  onErrorOption: NonNullable<
    EmberAsyncQueuerOptions<Value, Selected>['onError']
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
  addNumber = (result: Result) => {
    const nextNumber = result.state.items.length
      ? Math.max(...result.state.items) + 1
      : 1
    result.addItem(nextNumber)
  }
  getNextItem = (result: Result) => {
    result.getNextItem()
  }
  clear = (result: Result) => {
    result.clear()
  }
  start = (result: Result) => {
    result.start()
  }
  stop = (result: Result) => {
    result.stop()
  }
  <template>
    {{#let
      (useAsyncQueuedState
        this.processItem
        this.select
        maxSize=25
        initialItems=this.initialItemsOption
        concurrency=this.concurrency
        started=false
        wait=100
        onReject=this.onRejectOption
        onError=this.onErrorOption
      )
      as |result|
    }}{{#let result.state.items result as |queueItems asyncQueuer|}}<div><h1
          >TanStack Pacer useAsyncQueuer Example</h1><div></div><div>Queue Size:
            {{asyncQueuer.state.size}}</div><div>Queue Max Size:
            {{25}}</div><div>Queue Full:
            {{if asyncQueuer.state.isFull 'Yes' 'No'}}</div><div>Queue Empty:
            {{if asyncQueuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
            {{if asyncQueuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
            {{asyncQueuer.state.status}}</div><div>Items Processed:
            {{asyncQueuer.state.successCount}}</div><div>Items Rejected:
            {{asyncQueuer.state.rejectionCount}}</div><div>Active Tasks:
            {{asyncQueuer.state.activeItems.length}}</div><div>Pending Tasks:
            {{queueItems.length}}</div><div>
            Concurrency:{{space}}<input
              type='number'
              min={{1}}
              value={{this.concurrency}}
              {{on 'input' this.updateConcurrency}}
              style='width: 60px'
            /></div><div style='min-height: 250px'>
            Queue Items:{{#each queueItems as |item index|}}<div>{{index}}:
                {{item}}</div>{{/each}}</div><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
          ><button
              {{on 'click' (fn this.addNumber result)}}
              disabled={{asyncQueuer.state.isFull}}
            > Add Async Task</button><button
              {{on 'click' (fn this.getNextItem result)}}
            >Get Next Item</button><button
              {{on 'click' (fn this.clear result)}}
              disabled={{asyncQueuer.state.isEmpty}}
            > Clear Queue</button><br /><button
              {{on 'click' (fn this.start result)}}
              disabled={{asyncQueuer.state.isRunning}}
            > Start Processing</button><button
              {{on 'click' (fn this.stop result)}}
              disabled={{not asyncQueuer.state.isRunning}}
            > Stop Processing </button></div><pre
            style='margin-top: 20px'
          >{{json asyncQueuer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}
