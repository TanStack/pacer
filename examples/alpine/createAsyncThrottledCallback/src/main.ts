import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
interface SearchResult {
  id: number
  title: string
}
class Counter {
  private scope = createPacerScope()
  async fakeApi(term: string): Promise<Array<SearchResult>> {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    if (term === 'error') {
      throw new Error('Simulated API error')
    }
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  searchTerm = ''
  results: Array<SearchResult> = []
  isLoading = false
  error: string | null = null
  throttledSearch!: ReturnType<Counter['makeThrottledSearch']>
  makeThrottledSearch() {
    return this.scope.createAsyncThrottledCallback(
      async (term: string) => {
        if (!term.trim()) {
          this.results = []
          return []
        }
        this.isLoading = true
        this.error = null
        try {
          const data = await this.fakeApi(term)
          this.results = data
          return data
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error'
          this.error = errorMessage
          this.results = []
          throw err
        } finally {
          this.isLoading = false
        }
      },
      () => ({
        wait: 1000,
        // leading: true, // optional, defaults to true
        // trailing: true, // optional, defaults to true
      }),
    )
  }
  async handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await this.throttledSearch(newValue)
    } catch (err) {
      // Error is already handled in the throttled function
      console.log('Search failed:', err)
    }
  }
  init() {
    this.throttledSearch = this.makeThrottledSearch()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  count = 0
  apiCallCount = 0
  async incrementApi(value: number): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    this.apiCallCount = this.apiCallCount + 1
    return newCount
  }
  throttledIncrement!: ReturnType<Search['makeThrottledIncrement']>
  makeThrottledIncrement() {
    return this.scope.createAsyncThrottledCallback(
      async (currentValue: number) => {
        const result = await this.incrementApi(currentValue)
        this.count = result
        return result
      },
      () => ({
        wait: 1000,
        leading: true, // Execute immediately on first call
        trailing: true, // Execute after throttle period ends
      }),
    )
  }
  handleIncrement() {
    // Update local state immediately for instant feedback
    this.count = ((prev) => {
      const newCount = prev + 1
      this.throttledIncrement(newCount)
      return newCount
    })(this.count)
  }
  init() {
    this.throttledIncrement = this.makeThrottledIncrement()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  scrollPosition = 0
  saveCount = 0
  lastSaved: Date | null = null
  isSaving = false
  async saveScrollPosition(position: number): Promise<{
    success: boolean
    position: number
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }
  throttledSave!: ReturnType<Range['makeThrottledSave']>
  makeThrottledSave() {
    return this.scope.createAsyncThrottledCallback(
      async (position: number) => {
        this.isSaving = true
        try {
          const result = await this.saveScrollPosition(position)
          this.saveCount = this.saveCount + 1
          this.lastSaved = new Date()
          return result
        } finally {
          this.isSaving = false
        }
      },
      () => ({
        wait: 1000,
        leading: true,
        trailing: true,
      }),
    )
  }
  handleScroll(e: Event) {
    const position = (e.currentTarget as HTMLDivElement).scrollTop
    this.scrollPosition = position
    this.throttledSave(position)
  }
  init() {
    this.throttledSave = this.makeThrottledSave()
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
