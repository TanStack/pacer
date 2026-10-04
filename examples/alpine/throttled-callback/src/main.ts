import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantCount = 0
  instantCountRef = 0
  throttledCount = 0
  throttledSetCount!: ReturnType<Counter['makeThrottledSetCount']>
  makeThrottledSetCount() {
    return this.scope.createThrottler(
      (value: typeof this.throttledCount) => {
        this.throttledCount = value
      },
      () => ({
        wait: 1000,
        enabled: () => this.instantCountRef > 2,
      }),
    ).maybeExecute
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.throttledSetCount(nextCount)
  }
  init() {
    this.throttledSetCount = this.makeThrottledSetCount()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  searchText = ''
  searchTextRef = ''
  throttledSearchText = ''
  throttledSetSearch!: ReturnType<Search['makeThrottledSetSearch']>
  makeThrottledSetSearch() {
    return this.scope.createThrottler(
      (value: typeof this.throttledSearchText) => {
        this.throttledSearchText = value
      },
      () => ({
        wait: 1000,
        enabled: () => this.searchTextRef.length > 2,
      }),
    ).maybeExecute
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    this.throttledSetSearch(newValue)
  }
  init() {
    this.throttledSetSearch = this.makeThrottledSetSearch()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  currentValue = 50
  throttledValue = 50
  throttledSetValue!: ReturnType<Range['makeThrottledSetValue']>
  makeThrottledSetValue() {
    return this.scope.createThrottler(
      (value: typeof this.throttledValue) => {
        this.throttledValue = value
      },
      () => ({
        wait: 250,
      }),
    ).maybeExecute
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.throttledSetValue(newValue)
  }
  init() {
    this.throttledSetValue = this.makeThrottledSetValue()
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
