import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatcher } from '@tanstack/ember-pacer'
import type {
  EmberBatcher,
  BatcherState,
  EmberBatcherOptions,
} from '@tanstack/ember-pacer'

type Utility = EmberBatcher<number, BatcherState<number>>
const peekAll = (utility: Utility) => {
  void utility.state
  return utility.peekAllItems()
}
const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
const space = ' '
const eq = (a: unknown, b: unknown) => a === b
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked processedBatches: Array<Array<number>> = []
  processBatch = (items: Array<number>) => {
    this.processedBatches = [...this.processedBatches, items]
    console.log('processing batch', items)
  }
  select = (state: BatcherState<number>) => state
  getShouldExecuteOption: NonNullable<
    EmberBatcherOptions<number, BatcherState<number>>['getShouldExecute']
  > = (items, _batcher) => items.includes(42)
  addNumber = (utility: Utility) => {
    const nextNumber = utility.peekAllItems().length
      ? utility.peekAllItems()[utility.peekAllItems().length - 1]! + 1
      : 1
    utility.addItem(nextNumber)
  }
  flush = (utility: Utility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useBatcher
        this.processBatch
        this.select
        key='useBatcher'
        maxSize=5
        wait=3000
        getShouldExecute=this.getShouldExecuteOption
      )
      as |batcher|
    }}<div><h1>TanStack Pacer useBatcher Example 1</h1><div>Batch Size:
          {{batcher.state.size}}</div><div>Batch Max Size: {{5}}</div><div>Batch
          Items:
          {{join (peekAll batcher) ', '}}</div><div>Batches Processed:
          {{batcher.state.executionCount}}</div><div>Items Processed:
          {{batcher.state.totalItemsProcessed}}</div><div>
          Processed Batches:{{space}}{{#each
            this.processedBatches
            as |b i|
          }}<span>[{{join b ', '}}]</span>,{{space}}{{/each}}</div><div
          style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
        ><button {{on 'click' (fn this.addNumber batcher)}}>
            Add Number</button><button
            disabled={{eq batcher.state.size 0}}
            {{on 'click' (fn this.flush batcher)}}
          > Flush Current Batch </button></div><pre
          style='margin-top: 20px'
        >{{json batcher.state}}</pre></div>{{/let}}
  </template>
}
