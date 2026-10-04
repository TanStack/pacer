import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { batch } from '@tanstack/ember-pacer'

const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
export default class Example extends Component {
  @tracked processedBatches: Array<Array<number>> = []
  @tracked batchItems: Array<number> = []
  addToBatch = batch<number>(
    (items) => {
      this.processedBatches = [...this.processedBatches, items]
      console.log('Processing batch', items)
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
      onItemsChange: (batcherInstance) => {
        this.batchItems = batcherInstance.peekAllItems()
      },
    },
  )
  addNumber = () => {
    const nextNumber = this.batchItems.length
      ? this.batchItems[this.batchItems.length - 1]! + 1
      : 1
    this.addToBatch(nextNumber)
  }
  <template>
    <div><h1>TanStack Pacer batcher Example</h1><div>Batch Items:
        {{join this.batchItems ', '}}</div><div>Processed Batches:
        {{#each this.processedBatches as |b i|}}<span>[{{join b ', '}}],
          </span>{{/each}}</div><button {{on 'click' this.addNumber}}>
        Add Number
      </button></div>
  </template>
}
