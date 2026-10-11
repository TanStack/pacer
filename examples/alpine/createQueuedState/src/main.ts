import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  processItem(item: number) {
    console.log('processing item', item)
  }
  queuerResult!: ReturnType<Counter['makeQueuerResult']>
  makeQueuerResult() {
    return this.scope.createQueuedState(
      this.processItem.bind(this),
      () => ({
        maxSize: 25,
        initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        started: false,
        wait: 1000, // wait 1 second between processing items - wait is optional!
      }),
      (state) => state,
    )
  }
  get queueItems() {
    return this.queuerResult[0]
  }
  get addItem() {
    return this.queuerResult[1]
  }
  get queuer() {
    return this.queuerResult[2]
  }
  init() {
    this.queuerResult = this.makeQueuerResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  currentValue = 50
  queuedValue = 50
  submittedCount = 0
  queuerResult!: ReturnType<Search['makeQueuerResult']>
  makeQueuerResult() {
    return this.scope.createQueuedState(
      (item: number) => {
        this.queuedValue = item
      },
      () => ({
        maxSize: 100,
        started: true,
        wait: 100,
      }),
      (state) => state,
    )
  }
  get addItem() {
    return this.queuerResult[1]
  }
  get queuer() {
    return this.queuerResult[2]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    this.addItem(newValue)
  }
  init() {
    this.queuerResult = this.makeQueuerResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

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
