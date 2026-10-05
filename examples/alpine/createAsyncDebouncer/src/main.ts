import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type {
  AlpineAsyncDebouncer,
  AsyncDebouncerState,
} from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
interface SearchResult {
  id: number
  title: string
}
Alpine.data('demo', () => {
  const scope = createPacerScope()
  return {
    async fakeApi(term: string): Promise<Array<SearchResult>> {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
      return [
        { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      ]
    },
    searchTerm: '',
    results: [] as Array<SearchResult>,
    async handleSearch(term: string) {
      if (!term) {
        this.results = []
        return
      }
      // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
      const data = await this.fakeApi(term)
      this.results = data
      return data // this could alternatively be a void function without a return
    },
    async onSearchChange(e: Event) {
      const newTerm = (e.target as HTMLInputElement).value
      this.searchTerm = newTerm
      const result = await this.asyncDebouncer!.maybeExecute(newTerm) // optionally await result if you need to
      console.log('result', result)
    },
    asyncDebouncer: null as AlpineAsyncDebouncer<
      (term: string) => Promise<Array<SearchResult> | undefined>,
      AsyncDebouncerState<
        (term: string) => Promise<Array<SearchResult> | undefined>
      >
    > | null,
    init() {
      this.asyncDebouncer = scope.createAsyncDebouncer(
        this.handleSearch.bind(this),
        () => ({
          key: 'createAsyncDebouncer',
          // leading: true, // optional leading execution
          wait: 500, // Wait 500ms between API calls
          onError: (error) => {
            // optional error handler
            console.error('Search failed:', error)
            this.results = []
          },
          // throwOnError: true,
          asyncRetryerOptions: {
            maxAttempts: 3,
            maxExecutionTime: 3000,
          },
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('lifecycle', () => ({
  mounted: true,
  toggleMounted(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'Enter') this.mounted = !this.mounted
  },
}))

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
