import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  private scope = createPacerScope()
  instantCount = 0
  instantCountRef = 0
  debouncedCount = 0
  debouncedSetCount!: ReturnType<Counter['makeDebouncedSetCount']>
  makeDebouncedSetCount() {
    return this.scope.createDebouncedCallback(
      (value: typeof this.debouncedCount) => {
        this.debouncedCount = value
      },
      () => ({
        wait: 500,
        // enabled: () => this.instantCountRef > 2, // optional, defaults to true
        // leading: true, // optional, defaults to false
      }),
    )
  }
  increment() {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.debouncedSetCount(nextCount)
  }
  init() {
    this.debouncedSetCount = this.makeDebouncedSetCount()
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
  debouncedSearchText = ''
  debouncedSetSearch!: ReturnType<Search['makeDebouncedSetSearch']>
  makeDebouncedSetSearch() {
    return this.scope.createDebouncedCallback(
      (value: typeof this.debouncedSearchText) => {
        this.debouncedSearchText = value
      },
      () => ({
        wait: 500,
        enabled: () => this.searchTextRef.length > 2,
      }),
    )
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  init() {
    this.debouncedSetSearch = this.makeDebouncedSetSearch()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  currentValue = 50
  debouncedValue = 50
  debouncedSetValue!: ReturnType<Range['makeDebouncedSetValue']>
  makeDebouncedSetValue() {
    return this.scope.createDebouncedCallback(
      (value: typeof this.debouncedValue) => {
        this.debouncedValue = value
      },
      () => ({
        wait: 250,
      }),
    )
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.debouncedSetValue(newValue)
  }
  init() {
    this.debouncedSetValue = this.makeDebouncedSetValue()
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
