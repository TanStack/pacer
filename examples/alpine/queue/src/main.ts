import { queue } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  queueItems: Array<number> = []
  processedCount = 0
  processQueueItem(item: number) {
    console.log('Processing item:', item)
  }
  queueItem!: ReturnType<Counter['makeQueueItem']>
  makeQueueItem() {
    return queue<number>(this.processQueueItem.bind(this), {
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
  }
  init() {
    this.queueItem = this.makeQueueItem()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  queueItems: Array<string> = []
  processedCount = 0
  inputText = ''
  queuedText = ''
  processQueueItem(item: string) {
    this.queuedText = item
  }
  queueTextChange!: ReturnType<Search['makeQueueTextChange']>
  makeQueueTextChange() {
    return queue<string>(this.processQueueItem.bind(this), {
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
  }
  handleInputChange(e: Event) {
    this.inputText = (e.target as HTMLInputElement).value
    this.queueTextChange((e.target as HTMLInputElement).value)
  }
  init() {
    this.queueTextChange = this.makeQueueTextChange()
  }
}
Alpine.data('search', () => new Search())

class Range {
  queueItems: Array<number> = []
  processedCount = 0
  currentValue = 50
  queuedValue = 50
  processQueueItem(item: number) {
    this.queuedValue = item
  }
  queueValue!: ReturnType<Range['makeQueueValue']>
  makeQueueValue() {
    return queue<number>(this.processQueueItem.bind(this), {
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
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.queueValue(newValue)
  }
  init() {
    this.queueValue = this.makeQueueValue()
  }
}
Alpine.data('range', () => new Range())

Alpine.data('devtools', () => {
  let host: TanStackDevtoolsCore | undefined
  let target: HTMLDivElement | undefined
  return {
    init() {
      if (!import.meta.env.DEV) return
      target = document.createElement('div')
      document.body.append(target)
      host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
      host.mount(target)
    },
    destroy() {
      host?.unmount()
      target?.remove()
    },
  }
})
Alpine.start()
