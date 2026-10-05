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
  debouncedCountResult!: ReturnType<Counter['makeDebouncedCountResult']>
  makeDebouncedCountResult() {
    return this.scope.createDebouncedValue(
      () => this.instantCount,
      () => ({
        wait: 500,
        // enabled: () => instantCount > 2, // optional, defaults to true
        // leading: true, // optional, defaults to false
      }),
      (state) => state,
    )
  }
  get debouncedCount() {
    return this.debouncedCountResult[0]
  }
  init() {
    this.debouncedCountResult = this.makeDebouncedCountResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  instantSearch = ''
  debouncedSearchResult!: ReturnType<Search['makeDebouncedSearchResult']>
  makeDebouncedSearchResult() {
    return this.scope.createDebouncedValue(
      () => this.instantSearch,
      () => ({
        wait: 500,
        enabled: this.instantSearch.length > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get debouncedSearch() {
    return this.debouncedSearchResult[0]
  }
  handleSearchChange(e: Event) {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  init() {
    this.debouncedSearchResult = this.makeDebouncedSearchResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  currentValue = 50
  submittedCount = 1
  debouncerResult!: ReturnType<Range['makeDebouncerResult']>
  makeDebouncerResult() {
    return this.scope.createDebouncedValue(
      () => this.currentValue,
      () => ({
        wait: 250,
      }),
      (state) => state,
    )
  }
  get debouncedValue() {
    return this.debouncerResult[0]
  }
  get debouncer() {
    return this.debouncerResult[1]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  init() {
    this.debouncerResult = this.makeDebouncerResult()
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
