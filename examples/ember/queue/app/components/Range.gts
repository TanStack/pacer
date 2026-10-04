import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { queue } from '@tanstack/ember-pacer'

const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
export default class Range extends Component {
  @tracked queueItems: Array<number> = []
  @tracked processedCount = 0
  @tracked currentValue = 50
  @tracked queuedValue = 50
  processQueueItem = (item: number) => {
    this.queuedValue = item
  }
  queueValue = queue<number>(this.processQueueItem, {
    key: 'Range Change Queue',
    maxSize: 100,
    wait: 100,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.queueValue(newValue)
  }
  <template>
    <div><h1>TanStack Pacer queue Example 3</h1><div
        style='margin-bottom: 20px'
      ><label>Current Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.currentValue}}
            {{on 'input' this.handleRangeChange}}
            style='width: 100%'
          /><span>{{this.currentValue}}</span></label></div><div
        style='margin-bottom: 20px'
      ><label>Queued Range (Readonly):<input
            type='range'
            min='0'
            max='100'
            value={{this.queuedValue}}
            disabled
            style='width: 100%'
          /><span>{{this.queuedValue}}</span></label></div><table><tbody><tr><td
            >Queue Size:</td><td>{{this.queueItems.length}}</td></tr><tr><td
            >Items Processed:</td><td>{{this.processedCount}}</td></tr><tr><td
            >Queue Items:</td><td>{{join
                this.queueItems
                ', '
              }}</td></tr></tbody></table></div>
  </template>
}
