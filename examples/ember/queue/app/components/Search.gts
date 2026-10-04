import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { queue } from '@tanstack/ember-pacer'

const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
export default class Search extends Component {
  @tracked queueItems: Array<string> = []
  @tracked processedCount = 0
  @tracked inputText = ''
  @tracked queuedText = ''
  processQueueItem = (item: string) => {
    this.queuedText = item
  }
  queueTextChange = queue<string>(this.processQueueItem, {
    key: 'Text Change Queue',
    maxSize: 100,
    wait: 500,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  handleInputChange = (e: Event) => {
    this.inputText = (e.target as HTMLInputElement).value
    this.queueTextChange((e.target as HTMLInputElement).value)
  }
  <template>
    <div><h1>TanStack Pacer queue Example 2</h1><div><input
          type='search'
          value={{this.inputText}}
          {{on 'input' this.handleInputChange}}
          placeholder='Type to add to queue...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Queued Text:</td><td
            >{{this.queuedText}}</td></tr><tr><td>Queue Size:</td><td
            >{{this.queueItems.length}}</td></tr><tr><td>Items Processed:</td><td
            >{{this.processedCount}}</td></tr><tr><td>Queue Items:</td><td
            >{{join this.queueItems ', '}}</td></tr></tbody></table></div>
  </template>
}
