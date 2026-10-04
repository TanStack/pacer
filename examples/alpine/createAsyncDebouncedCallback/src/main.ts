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
  debouncedSearch!: ReturnType<Counter['makeDebouncedSearch']>
  makeDebouncedSearch() {
    return this.scope.createAsyncDebouncedCallback(
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
        wait: 500,
        // leading: true, // optional, defaults to false
        // trailing: true, // optional, defaults to true
      }),
    )
  }
  async handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await this.debouncedSearch(newValue)
    } catch (err) {
      // Error is already handled in the debounced function
      console.log('Search failed:', err)
    }
  }
  init() {
    this.debouncedSearch = this.makeDebouncedSearch()
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
  debouncedIncrement!: ReturnType<Search['makeDebouncedIncrement']>
  makeDebouncedIncrement() {
    return this.scope.createAsyncDebouncedCallback(
      async (currentValue: number) => {
        const result = await this.incrementApi(currentValue)
        this.count = result
        return result
      },
      () => ({
        wait: 1000,
        leading: false, // Don't execute immediately
        trailing: true, // Execute after delay
      }),
    )
  }
  handleIncrement() {
    // Update local state immediately for instant feedback
    const newCount = this.count + 1
    this.count = newCount
    // Debounced API call
    this.debouncedIncrement(newCount)
  }
  init() {
    this.debouncedIncrement = this.makeDebouncedIncrement()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  email = ''
  validationResult: {
    isValid: boolean
    message: string
  } | null = null
  isValidating = false
  async validateEmail(emailAddress: string): Promise<{
    isValid: boolean
    message: string
  }> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)
    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }
  debouncedValidateEmail!: ReturnType<Range['makeDebouncedValidateEmail']>
  makeDebouncedValidateEmail() {
    return this.scope.createAsyncDebouncedCallback(
      async (emailAddress: string) => {
        if (!emailAddress.trim()) {
          this.validationResult = null
          return null
        }
        this.isValidating = true
        try {
          const result = await this.validateEmail(emailAddress)
          this.validationResult = result
          return result
        } finally {
          this.isValidating = false
        }
      },
      () => ({
        wait: 750,
        leading: false,
      }),
    )
  }
  handleEmailChange(e: Event) {
    const newEmail = (e.target as HTMLInputElement).value
    this.email = newEmail
    this.debouncedValidateEmail(newEmail)
  }
  init() {
    this.debouncedValidateEmail = this.makeDebouncedValidateEmail()
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
