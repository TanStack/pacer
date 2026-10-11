import { asyncRateLimit } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Demo {
  windowType: 'fixed' | 'sliding' = 'fixed'
  searchText = ''
  rateLimitedSearchText = ''
  searchResults: Array<string> = []
  loading = false
  async simulateSearch(query: string) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }
  rateLimitedSetSearchWindow = this.windowType
  rateLimitedSetSearchFunction!: ReturnType<
    Demo['makeRateLimitedSetSearchFunction']
  >
  makeRateLimitedSetSearchFunction() {
    return asyncRateLimit(
      async (value: string) => {
        try {
          this.loading = true
          this.rateLimitedSearchText = value
          const results = await this.simulateSearch(value)
          this.searchResults = results
        } catch (err) {
          this.searchResults = []
        } finally {
          this.loading = false
        }
      },
      {
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        onReject: (_args, rateLimiter) => {
          console.log(
            `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
          )
        },
      },
    )
  }
  get rateLimitedSetSearch() {
    if (this.rateLimitedSetSearchWindow !== this.windowType) {
      this.rateLimitedSetSearchWindow = this.windowType
      this.rateLimitedSetSearchFunction = asyncRateLimit(
        async (value: string) => {
          try {
            this.loading = true
            this.rateLimitedSearchText = value
            const results = await this.simulateSearch(value)
            this.searchResults = results
          } catch (err) {
            this.searchResults = []
          } finally {
            this.loading = false
          }
        },
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (_args, rateLimiter) => {
            console.log(
              `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
            )
          },
        },
      )
    }
    return this.rateLimitedSetSearchFunction
  }
  init() {
    this.rateLimitedSetSearchFunction = this.makeRateLimitedSetSearchFunction()
  }
}
Alpine.data('demo', () => new Demo())

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
