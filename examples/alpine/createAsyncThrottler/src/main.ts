import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type {
  AlpineAsyncThrottler,
  AsyncThrottlerState,
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
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      return [
        { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      ]
    },
    searchTerm: '',
    results: [] as Array<SearchResult>,
    error: null as Error | null,
    async handleSearch(term: string) {
      if (!term) {
        this.results = []
        return
      }
      // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
      const data = await this.fakeApi(term)
      this.results = data
      this.error = null
      return data // this could alternatively be a void function without a return
    },
    async onSearchChange(e: Event) {
      const newTerm = (e.target as HTMLInputElement).value
      this.searchTerm = newTerm
      const result = await this.setSearchAsyncThrottler!.maybeExecute(newTerm) // optionally await if you need to
      console.log('result', result)
    },
    setSearchAsyncThrottler: null as AlpineAsyncThrottler<
      (term: string) => Promise<Array<SearchResult> | undefined>,
      AsyncThrottlerState<
        (term: string) => Promise<Array<SearchResult> | undefined>
      >
    > | null,
    init() {
      this.setSearchAsyncThrottler = scope.createAsyncThrottler(
        this.handleSearch.bind(this),
        () => ({
          key: 'createAsyncThrottler',
          // leading: true, // default
          // trailing: true, // default
          wait: 1000, // Wait 1 second between API calls
          onError: (cause) => {
            // optional error handler
            console.error('Search failed:', cause)
            this.error = cause as Error
            this.results = []
          },
          // throwOnError: true,
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

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
