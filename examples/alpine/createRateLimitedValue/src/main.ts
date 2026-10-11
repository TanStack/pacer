import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  limitedCountResult!: ReturnType<Counter['makeLimitedCountResult']>
  makeLimitedCountResult() {
    return this.scope.createRateLimitedValue(
      () => this.instantCount,
      () => ({
        // enabled: () => instantCount > 2, // optional, defaults to true
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
    return this.limitedCountResult[0]
  }
  increment() {
    this.instantCount = this.instantCount + 1
  }
  init() {
    this.limitedCountResult = this.makeLimitedCountResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantSearch = ''
  limitedSearchResult!: ReturnType<Search['makeLimitedSearchResult']>
  makeLimitedSearchResult() {
    return this.scope.createRateLimitedValue(
      () => this.instantSearch,
      () => ({
        // enabled: instantSearch.length > 2, // optional, defaults to true
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
    return this.limitedSearchResult[0]
  }
  handleSearchChange(e: Event) {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  init() {
    this.limitedSearchResult = this.makeLimitedSearchResult()
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
  submittedCount = 1
  rateLimiterResult!: ReturnType<Range['makeRateLimiterResult']>
  makeRateLimiterResult() {
    return this.scope.createRateLimitedValue(
      () => this.currentValue,
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
  get rateLimiter() {
    return this.rateLimiterResult[1]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
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
