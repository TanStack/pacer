import { asyncThrottle } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Demo {
  searchText = ''
  throttledSearchText = ''
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
  throttledSetSearch!: ReturnType<Demo['makeThrottledSetSearch']>
  makeThrottledSetSearch() {
    return asyncThrottle(
      async (value: string) => {
        try {
          this.loading = true
          this.throttledSearchText = value
          const results = await this.simulateSearch(value)
          this.searchResults = results
        } catch (err) {
          this.searchResults = []
        } finally {
          this.loading = false
        }
      },
      {
        wait: 1000,
      },
    )
  }
  init() {
    this.throttledSetSearch = this.makeThrottledSetSearch()
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
