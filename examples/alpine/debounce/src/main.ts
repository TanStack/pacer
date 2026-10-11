import { debounce } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  instantCount = 0
  debouncedCount = 0
  debouncedSetCount!: ReturnType<Counter['makeDebouncedSetCount']>
  makeDebouncedSetCount() {
    return debounce(
      (value: typeof this.debouncedCount) => (this.debouncedCount = value),
      {
        wait: 500,
        // leading: true, // optional, defaults to false
      },
    )
  }
  increment() {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  init() {
    this.debouncedSetCount = this.makeDebouncedSetCount()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  searchText = ''
  debouncedSearchText = ''
  debouncedSetSearch!: ReturnType<Search['makeDebouncedSetSearch']>
  makeDebouncedSetSearch() {
    return debounce(
      (value: typeof this.debouncedSearchText) =>
        (this.debouncedSearchText = value),
      {
        wait: 500,
      },
    )
  }
  handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  init() {
    this.debouncedSetSearch = this.makeDebouncedSetSearch()
  }
}
Alpine.data('search', () => new Search())

class Range {
  instantValue = 50
  debouncedValue = 50
  debouncedSetValue!: ReturnType<Range['makeDebouncedSetValue']>
  makeDebouncedSetValue() {
    return debounce(
      (value: typeof this.debouncedValue) => (this.debouncedValue = value),
      {
        wait: 250,
      },
    )
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.instantValue = newValue
    this.debouncedSetValue(newValue)
  }
  init() {
    this.debouncedSetValue = this.makeDebouncedSetValue()
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
