import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type {
  EmberAsyncBatcher,
  AsyncBatcherState,
  EmberAsyncBatcherOptions,
} from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type Item = {
  id: number
  value: string
  timestamp: number
}
type Utility = EmberAsyncBatcher<Item, AsyncBatcherState<Item>>
const eq = (a: unknown, b: unknown) => a === b
const add = (a: number, b: number) => a + b
const space = ' '
const itemLabel = (item: Item, index: number) =>
  `${index + 1}: ${item.value} (added at ${new Date(item.timestamp).toLocaleTimeString()})`
const time = (value: number) => new Date(value).toLocaleTimeString()
const or = (a: unknown, b: unknown) => Boolean(a || b)
const gt = (a: number, b: number) => a > b
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Example extends Component {
  fakeProcessingTime = 1000
  @tracked processedBatches: Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }> = []
  @tracked errors: Array<string> = []
  processBatch = async (items: Array<Item>): Promise<string> => {
    console.log('Processing batch of', items.length, 'items:', items)
    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, this.fakeProcessingTime))
    // Simulate occasional failures for demo purposes
    // throw new Error(`Processing failed for batch with ${items.length} items`)
    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
    this.processedBatches = [
      ...this.processedBatches,
      { items, result, timestamp: Date.now() },
    ]
    return result
  }
  addItem = (utility: Utility, isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    utility.addItem(item)
  }
  executeCurrentBatch = async (utility: Utility) => {
    try {
      const result = await utility.flush()
      console.log('Manual execution result:', result)
    } catch (error) {
      console.error('Manual execution failed:', error)
    }
  }
  select = (state: AsyncBatcherState<Item>) => state
  getShouldExecuteOption: NonNullable<
    EmberAsyncBatcherOptions<Item, AsyncBatcherState<Item>>['getShouldExecute']
  > = (items) => items.some((item) => item.value.includes('urgent'))
  onSuccessOption: NonNullable<
    EmberAsyncBatcherOptions<Item, AsyncBatcherState<Item>>['onSuccess']
  > = (result, batch, batcher) => {
    console.log('Batch succeeded:', result)
    console.log('Processed batch:', batch)
    console.log('Total successful batches:', batcher.store.state.successCount)
  }
  onErrorOption: NonNullable<
    EmberAsyncBatcherOptions<Item, AsyncBatcherState<Item>>['onError']
  > = (error: any, _batcher) => {
    console.error('Batch failed:', error)
    this.errors = [
      ...this.errors,
      `Error: ${error} (${new Date().toLocaleTimeString()})`,
    ]
  }
  onSettledOption: NonNullable<
    EmberAsyncBatcherOptions<Item, AsyncBatcherState<Item>>['onSettled']
  > = (batch, batcher) => {
    console.log('Batch settled:', batch)
    console.log(
      'Total processed items:',
      batcher.store.state.totalItemsProcessed,
    )
  }
  addRegularItem = (utility: Utility) => {
    this.addItem(utility, false)
  }
  addUrgentItem = (utility: Utility) => {
    this.addItem(utility, true)
  }
  clear = (utility: Utility) => {
    utility.clear()
  }
  clearErrors = () => {
    this.errors = []
  }
  <template>
    {{#let
      (useAsyncBatcher
        this.processBatch
        this.select
        key='useAsyncBatcher'
        maxSize=5
        wait=4000
        getShouldExecute=this.getShouldExecuteOption
        throwOnError=false
        onSuccess=this.onSuccessOption
        onError=this.onErrorOption
        onSettled=this.onSettledOption
      )
      as |asyncBatcher|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example</h1><div><h3>Batch Status</h3><div
          >Current Batch Size: {{asyncBatcher.state.size}}</div><div>Max Batch
            Size: 5</div><div>Is Executing:
            {{if asyncBatcher.state.isExecuting 'Yes' 'No'}}</div><div>Status:
            {{asyncBatcher.state.status}}</div><div>Successful Batches:
            {{asyncBatcher.state.successCount}}</div><div>Failed Batches:
            {{asyncBatcher.state.errorCount}}</div><div>Total Items Processed:
            {{asyncBatcher.state.totalItemsProcessed}}</div></div><div><h3
          >Current Batch Items</h3><div style='min-height: 100px'>{{#if
              (eq asyncBatcher.state.items.length 0)
            }}<em>No items in current batch</em>{{else}}{{#each
                asyncBatcher.state.items
                as |item index|
              }}<div>{{itemLabel
                    item
                    index
                  }}</div>{{/each}}{{/if}}</div></div><div><h3>Controls</h3><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px'
          ><button {{on 'click' (fn this.addRegularItem asyncBatcher)}}>Add
              Regular Item</button><button
              {{on 'click' (fn this.addUrgentItem asyncBatcher)}}
            > Add Urgent Item (Processes Immediately)</button><button
              disabled={{or
                (eq asyncBatcher.state.size 0)
                asyncBatcher.state.isExecuting
              }}
              {{on 'click' (fn this.executeCurrentBatch asyncBatcher)}}
            > Process Current Batch Now</button><button
              {{on 'click' (fn this.clear asyncBatcher)}}
              disabled={{or
                (eq asyncBatcher.state.size 0)
                asyncBatcher.state.isExecuting
              }}
            > Clear Current Batch </button></div></div><div><h3>Processed
            Batches ({{this.processedBatches.length}})</h3><div>{{#if
              (eq this.processedBatches.length 0)
            }}<em>No batches processed yet</em>{{else}}{{#each
                this.processedBatches
                as |batch index|
              }}<div><strong>Batch {{add index 1}}</strong>
                  (processed at{{space}}{{time batch.timestamp}})
                  <div
                  >{{batch.result}}</div></div>{{/each}}{{/if}}</div></div>{{#if
          (gt this.errors.length 0)
        }}<div><h3>Errors ({{this.errors.length}})</h3><div>{{#each
                this.errors
                as |error index|
              }}<div>{{error}}</div>{{/each}}</div><button
              {{on 'click' this.clearErrors}}
            >Clear Errors</button></div>{{/if}}<pre
          style='margin-top: 20px'
        >{{json asyncBatcher.state}}</pre></div>{{/let}}
  </template>
}

export default class Application extends Component {
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    <div><Example /></div>
  </template>
}
