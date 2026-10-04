import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantCount = 0
  instantCountRef = 0
  throttlerResult!: ReturnType<Counter['makeThrottlerResult']>
  makeThrottlerResult() {
    return this.scope.createThrottledState(
      this.instantCount,
      () => ({
        wait: 1000,
        // enabled: () => this.instantCountRef > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get throttledCount() {
    return this.throttlerResult[0]
  }
  get setThrottledCount() {
    return this.throttlerResult[1]
  }
  get throttler() {
    return this.throttlerResult[2]
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.setThrottledCount(nextCount)
  }
  init() {
    this.throttlerResult = this.makeThrottlerResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  instantSearch = ''
  instantSearchRef = ''
  throttlerResult!: ReturnType<Search['makeThrottlerResult']>
  makeThrottlerResult() {
    return this.scope.createThrottledState(
      this.instantSearch,
      () => ({
        wait: 1000,
        // enabled: () => this.instantSearchRef.length > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get throttledSearch() {
    return this.throttlerResult[0]
  }
  get setThrottledSearch() {
    return this.throttlerResult[1]
  }
  get throttler() {
    return this.throttlerResult[2]
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    this.setThrottledSearch(newValue)
  }
  init() {
    this.throttlerResult = this.makeThrottlerResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  instantExecutionCount = 0
  currentValue = 50
  throttlerResult!: ReturnType<Range['makeThrottlerResult']>
  makeThrottlerResult() {
    return this.scope.createThrottledState(
      this.currentValue,
      () => ({
        wait: 250,
      }),
      (state) => state,
    )
  }
  get throttledValue() {
    return this.throttlerResult[0]
  }
  get setThrottledValue() {
    return this.throttlerResult[1]
  }
  get throttler() {
    return this.throttlerResult[2]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.setThrottledValue(newValue)
    this.instantExecutionCount = this.instantExecutionCount + 1
  }
  init() {
    this.throttlerResult = this.makeThrottlerResult()
  }
  destroy() {
    this.scope.destroy()
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
