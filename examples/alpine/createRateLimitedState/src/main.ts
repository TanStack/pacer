import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  alert = window.alert.bind(window)
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  instantCountRef = 0
  rateLimiterResult!: ReturnType<Counter['makeRateLimiterResult']>
  makeRateLimiterResult() {
    return this.scope.createRateLimitedState(
      this.instantCount,
      () => ({
        // enabled: () => this.instantCountRef > 2, // optional, defaults to true
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      }),
      (state) => state,
    )
  }
  get limitedCount() {
    return this.rateLimiterResult[0]
  }
  get setLimitedCount() {
    return this.rateLimiterResult[1]
  }
  get rateLimiter() {
    return this.rateLimiterResult[2]
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.setLimitedCount(nextCount)
  }
  init() {
    this.rateLimiterResult = this.makeRateLimiterResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  alert = window.alert.bind(window)
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantSearch = ''
  instantSearchRef = ''
  rateLimiterResult!: ReturnType<Search['makeRateLimiterResult']>
  makeRateLimiterResult() {
    return this.scope.createRateLimitedState(
      this.instantSearch,
      () => ({
        // enabled: () => this.instantSearchRef.length > 2, // optional, defaults to true
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      }),
      (state) => state,
    )
  }
  get limitedSearch() {
    return this.rateLimiterResult[0]
  }
  get setLimitedSearch() {
    return this.rateLimiterResult[1]
  }
  get rateLimiter() {
    return this.rateLimiterResult[2]
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    this.setLimitedSearch(newValue)
  }
  init() {
    this.rateLimiterResult = this.makeRateLimiterResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  windowType: 'fixed' | 'sliding' = 'fixed'
  currentValue = 50
  instantExecutionCount = 0
  rateLimiterResult!: ReturnType<Range['makeRateLimiterResult']>
  makeRateLimiterResult() {
    return this.scope.createRateLimitedState(
      this.currentValue,
      () => ({
        limit: 20,
        window: 2000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      }),
      (state) => state,
    )
  }
  get limitedValue() {
    return this.rateLimiterResult[0]
  }
  get setLimitedValue() {
    return this.rateLimiterResult[1]
  }
  get rateLimiter() {
    return this.rateLimiterResult[2]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.setLimitedValue(newValue)
  }
  init() {
    this.rateLimiterResult = this.makeRateLimiterResult()
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
