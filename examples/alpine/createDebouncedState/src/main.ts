import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantCount = 0
  instantCountRef = 0
  debouncerResult!: ReturnType<Counter['makeDebouncerResult']>
  makeDebouncerResult() {
    return this.scope.createDebouncedState(
      this.instantCount,
      () => ({
        wait: 500,
        // enabled: () => this.instantCountRef > 2, // optional, defaults to true
        // leading: true, // optional, defaults to false
      }),
      (state) => state,
    )
  }
  get debouncedCount() {
    return this.debouncerResult[0]
  }
  get setDebouncedCount() {
    return this.debouncerResult[1]
  }
  get debouncer() {
    return this.debouncerResult[2]
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.setDebouncedCount(nextCount)
  }
  init() {
    this.debouncerResult = this.makeDebouncerResult()
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
  debouncerResult!: ReturnType<Search['makeDebouncerResult']>
  makeDebouncerResult() {
    return this.scope.createDebouncedState(
      this.instantSearch,
      () => ({
        wait: 500,
        enabled: () => this.instantSearchRef.length > 2, // optional, defaults to true
      }),
      (state) => state,
    )
  }
  get debouncedSearch() {
    return this.debouncerResult[0]
  }
  get setDebouncedSearch() {
    return this.debouncerResult[1]
  }
  get debouncer() {
    return this.debouncerResult[2]
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    this.setDebouncedSearch(newValue)
  }
  init() {
    this.debouncerResult = this.makeDebouncerResult()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  currentValue = 50
  instantExecutionCount = 0
  debouncerResult!: ReturnType<Range['makeDebouncerResult']>
  makeDebouncerResult() {
    return this.scope.createDebouncedState(
      this.currentValue,
      () => ({
        wait: 250,
      }),
      (state) => state,
    )
  }
  get debouncedValue() {
    return this.debouncerResult[0]
  }
  get setDebouncedValue() {
    return this.debouncerResult[1]
  }
  get debouncer() {
    return this.debouncerResult[2]
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.setDebouncedValue(newValue)
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
