import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type {
  AlpineAsyncRateLimiter,
  AsyncRateLimiterState,
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
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      return [
        { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
        { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      ]
    },
    windowType: 'fixed' as 'fixed' | 'sliding',
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
    },
    async onSearchChange(e: Event) {
      const newTerm = (e.target as HTMLInputElement).value
      this.searchTerm = newTerm
      await this.setSearchAsyncRateLimiter!.maybeExecute(newTerm) // optionally await if you need to
    },
    setSearchAsyncRateLimiter: null as AlpineAsyncRateLimiter<
      (term: string) => Promise<void>,
      AsyncRateLimiterState<(term: string) => Promise<void>>
    > | null,
    init() {
      this.setSearchAsyncRateLimiter = scope.createAsyncRateLimiter(
        this.handleSearch.bind(this),
        () => ({
          key: 'createAsyncRateLimiter',
          windowType: this.windowType,
          limit: 3, // Maximum 3 requests
          window: 3000, // per 3 seconds
          onReject: (_args, rateLimiter) => {
            console.log(
              `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
            )
          },
          onError: (cause) => {
            // optional error handler
            console.error('Search failed:', cause)
            this.error = cause as Error
            this.results = []
          },
        }),
        (state) => state,
      )
    },
    destroy() {
      ;(() => {
        console.log('unmount')
        this.setSearchAsyncRateLimiter!.reset() // cancel any pending async calls when the component unmounts
      })()
      scope.destroy()
    },
  }
})

Alpine.data('lifecycle', () => ({
  mounted: true,
  toggleMounted(event: KeyboardEvent) {
    if (event.key === 'Enter') this.mounted = !this.mounted
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
