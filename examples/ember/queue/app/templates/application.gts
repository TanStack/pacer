import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { queue } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

const counterJoin = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
class Counter extends Component {
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
              Items:</td><td>{{counterJoin
                this.queueItems
                ', '
              }}</td></tr></tbody></table><button
        {{on 'click' this.addNumber}}
        disabled={{this.isQueueFull}}
      > Add Number </button></div>
  </template>
}

const searchJoin = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
class Search extends Component {
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
            >{{searchJoin this.queueItems ', '}}</td></tr></tbody></table></div>
  </template>
}

const rangeJoin = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
class Range extends Component {
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
            >Queue Items:</td><td>{{rangeJoin
                this.queueItems
                ', '
              }}</td></tr></tbody></table></div>
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
    <div><Counter /><hr /><Search /><hr /><Range /></div>
  </template>
}
