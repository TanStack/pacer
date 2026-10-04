import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  instantCountRef = 0
  rateLimitedCount = 0
  rateLimitedSetCount!: ReturnType<Counter['makeRateLimitedSetCount']>
  makeRateLimitedSetCount() {
    return this.scope.createRateLimitedCallback(
      (value: typeof this.rateLimitedCount) => {
        this.rateLimitedCount = value
      },
      () => ({
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        enabled: () => this.instantCountRef > 2,
        onReject: (rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      }),
    )
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.rateLimitedSetCount(nextCount)
  }
  init() {
    this.rateLimitedSetCount = this.makeRateLimitedSetCount()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  windowType: 'fixed' | 'sliding' = 'fixed'
  searchText = ''
  searchTextRef = ''
  rateLimitedSearchText = ''
  rateLimitedSetSearch!: ReturnType<Search['makeRateLimitedSetSearch']>
  makeRateLimitedSetSearch() {
    return this.scope.createRateLimitedCallback(
      (value: typeof this.rateLimitedSearchText) => {
        this.rateLimitedSearchText = value
      },
      () => ({
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        enabled: () => this.searchTextRef.length > 2,
        onReject: (rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      }),
    )
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    this.rateLimitedSetSearch(newValue)
  }
  init() {
    this.rateLimitedSetSearch = this.makeRateLimitedSetSearch()
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
  limitedValue = 50
  rateLimitedSetValue!: ReturnType<Range['makeRateLimitedSetValue']>
  makeRateLimitedSetValue() {
    return this.scope.createRateLimitedCallback(
      (value: typeof this.limitedValue) => {
        this.limitedValue = value
      },
      () => ({
        limit: 20,
        window: 2000,
        windowType: this.windowType,
        onReject: (rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      }),
    )
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.rateLimitedSetValue(newValue)
  }
  init() {
    this.rateLimitedSetValue = this.makeRateLimitedSetValue()
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
