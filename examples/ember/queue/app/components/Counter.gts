import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { queue } from '@tanstack/ember-pacer'

const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
export default class Counter extends Component {
  @tracked queueItems: Array<number> = []
  @tracked processedCount = 0
  processQueueItem = (item: number) => {
    console.log('Processing item:', item)
  }
  queueItem = queue<number>(this.processQueueItem, {
    key: 'Add Number Queue',
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  addNumber = () => {
    const nextNumber = this.queueItems.length
      ? this.queueItems[this.queueItems.length - 1]! + 1
      : 1
    this.queueItem(nextNumber)
  }
  get isQueueFull() {
    return this.queueItems.length >= 25
  }
  <template>
    <div><h1>TanStack Pacer queue Example 1</h1><table><tbody><tr><td>Queue
              Size:</td><td>{{this.queueItems.length}}</td></tr><tr><td>Items
              Processed:</td><td>{{this.processedCount}}</td></tr><tr><td>Queue
              Items:</td><td>{{join
                this.queueItems
                ', '
              }}</td></tr></tbody></table><button
        {{on 'click' this.addNumber}}
        disabled={{this.isQueueFull}}
      > Add Number </button></div>
  </template>
}
