import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantCount = 0
  increment() {
    this.instantCount = this.instantCount + 1
  }
  throttledCountResult!: ReturnType<Counter['makeThrottledCountResult']>
  makeThrottledCountResult() {
    return this.scope.createThrottledValue(
      () => this.instantCount,
      () => ({
        wait: 1000,
        // enabled: () => instantCount > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get throttledCount() {
    return this.throttledCountResult[0]
  }
  init() {
    this.throttledCountResult = this.makeThrottledCountResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  instantSearch = ''
  throttledSearchResult!: ReturnType<Search['makeThrottledSearchResult']>
  makeThrottledSearchResult() {
    return this.scope.createThrottledValue(
      () => this.instantSearch,
      () => ({
        wait: 1000,
        // enabled: instantSearch.length > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get throttledSearch() {
    return this.throttledSearchResult[0]
  }
  handleSearchChange(e: Event) {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  init() {
    this.throttledSearchResult = this.makeThrottledSearchResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  submittedCount = 1
  currentValue = 50
  throttlerResult!: ReturnType<Range['makeThrottlerResult']>
  makeThrottlerResult() {
    return this.scope.createThrottledValue(
      () => this.currentValue,
      () => ({
        wait: 250,
      }),
      (state) => state,
    )
  }
  get throttledValue() {
    return this.throttlerResult[0]
  }
  get throttler() {
    return this.throttlerResult[1]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
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
