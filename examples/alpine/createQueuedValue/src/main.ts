import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantSearchValue = ''
  queuerResult!: ReturnType<Counter['makeQueuerResult']>
  makeQueuerResult() {
    return this.scope.createQueuedValue(
      () => this.instantSearchValue,
      () => ({
        maxSize: 25,
        wait: 500, // wait 500ms between processing value changes
      }),
      (state) => state,
    )
  }
  get value() {
    return this.queuerResult[0]
  }
  get queuer() {
    return this.queuerResult[1]
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
  submittedCount = 1
  queuerResult!: ReturnType<Search['makeQueuerResult']>
  makeQueuerResult() {
    return this.scope.createQueuedValue(
      () => this.currentValue,
      () => ({
        maxSize: 100,
        wait: 100,
      }),
      (state) => state,
    )
  }
  get queuedValue() {
    return this.queuerResult[0]
  }
  get queuer() {
    return this.queuerResult[1]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
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
