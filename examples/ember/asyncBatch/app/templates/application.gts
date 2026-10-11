import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { asyncBatch } from '@tanstack/ember-pacer'
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
const eq = (a: unknown, b: unknown) => a === b
const add = (a: number, b: number) => a + b
const space = ' '
const time = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
const gt = (a: number, b: number) => a > b
class Example extends Component {
  fakeProcessingTime = 1000
  @tracked processedBatches: Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }> = []
  @tracked errors: Array<string> = []
  @tracked pendingItems: Array<Item> = []
  @tracked isProcessing = false
  @tracked shouldFail = false
  @tracked successCount = 0
  @tracked errorCount = 0
  processBatch = async (items: Array<Item>): Promise<string> => {
    console.log('Processing batch of', items.length, 'items:', items)
    this.isProcessing = true
    try {
      // Simulate async processing time
      await new Promise((resolve) =>
        setTimeout(resolve, this.fakeProcessingTime),
      )
      // Simulate occasional failures for demo purposes
      if (this.shouldFail && Math.random() < 0.3) {
        throw new Error(
          `Processing failed for batch with ${items.length} items`,
        )
      }
      // Return a result from the batch processing
      const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
      this.processedBatches = [
        ...this.processedBatches,
        { items, result, timestamp: Date.now() },
      ]
      this.successCount = this.successCount + 1
      console.log('Batch succeeded:', result)
      return result
    } catch (error: any) {
      this.errors = [
        ...this.errors,
        `Error: ${error} (${new Date().toLocaleTimeString()})`,
      ]
      this.errorCount = this.errorCount + 1
      console.error('Batch failed:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }
  @tracked addToBatch = asyncBatch<Item>(this.processBatch, {
    maxSize: 5,
    wait: 3000,
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')),
    throwOnError: false, // Don't throw errors, handle them in the processBatch function
    onItemsChange: (batcher) => {
      this.pendingItems = batcher.peekAllItems()
    },
    onSuccess: (result, batch, batcher) => {
      console.log('AsyncBatcher succeeded:', result)
      console.log('Processed batch:', batch)
      console.log('Total successful batches:', batcher.store.state.successCount)
    },
    onError: (error: any, failedItems, batcher) => {
      console.error('AsyncBatcher failed:', error)
      console.log('Failed items:', failedItems)
      console.log('Total failed batches:', batcher.store.state.errorCount)
    },
    onSettled: (batch, batcher) => {
      console.log('Batch settled:', batch)
      console.log(
        'Total processed items:',
        batcher.store.state.totalItemsProcessed,
      )
    },
  })
  addItem = (isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    this.addToBatch(item)
  }
  addRegularItem = () => {
    this.addItem(false)
  }
  addUrgentItem = () => {
    this.addItem(true)
  }
  toggleFailures = (e: Event) => {
    this.shouldFail = (e.target as HTMLInputElement).checked
  }
  clearErrors = () => {
    this.errors = []
  }
  <template>
    <div><h1>TanStack Pacer asyncBatch Example</h1><div><h3>Batch Status</h3><div
        >Pending Items: {{this.pendingItems.length}}</div><div>Max Batch Size: 5</div><div
        >Is Processing: {{if this.isProcessing 'Yes' 'No'}}</div><div>Successful
          Batches:
          {{this.successCount}}</div><div>Failed Batches:
          {{this.errorCount}}</div></div><div><h3>Current Pending Items</h3><div
          style='min-height: 100px'
        >{{#if (eq this.pendingItems.length 0)}}<em>No items pending</em>{{else}}{{#each
              this.pendingItems
              as |item index|
            }}<div>{{add index 1}}:
                {{item.value}}
                (added at{{space}}{{time item.timestamp}})
              </div>{{/each}}{{/if}}</div></div><div><h3>Controls</h3><div
          style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px'
        ><button {{on 'click' this.addRegularItem}}>Add Regular Item</button><button
            {{on 'click' this.addUrgentItem}}
          > Add Urgent Item (Processes Immediately) </button></div><div><label
          ><input
              type='checkbox'
              checked={{this.shouldFail}}
              {{on 'input' this.toggleFailures}}
            />{{space}}Simulate random failures (30% chance)</label></div></div><div
      ><h3>Processed Batches ({{this.processedBatches.length}})</h3><div>{{#if
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
          >Clear Errors</button></div>{{/if}}</div>
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
