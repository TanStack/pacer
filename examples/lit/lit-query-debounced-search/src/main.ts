import {
  QueryClient,
  QueryClientProvider,
  createQueryController,
  keepPreviousData,
  onlineManager,
} from '@tanstack/lit-query'
import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { TanstackQueryDevtoolsPanel } from '@tanstack/query-devtools'
import { createDebouncedValue } from '@tanstack/lit-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import type { TanStackDevtoolsPlugin } from '@tanstack/devtools'

interface Post {
  id: number
  title: string
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

const posts: Array<Post> = [
  'Getting started with TanStack Query',
  'Debouncing user input',
  'Throttling scroll handlers',
  'Rate limiting API calls',
  'Queueing background work',
  'Batching writes to the server',
  'Prefetching data on hover',
  'Caching search results',
  'Cancelling stale requests',
  'Optimistic updates with mutations',
  'Retrying failed queries',
  'Keeping previous data while fetching',
].map((title, index) => ({ id: index + 1, title }))

// A fake search API with a slow response that can be cancelled
function searchPosts(term: string, signal: AbortSignal) {
  return new Promise<Array<Post>>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(
        posts.filter((post) =>
          post.title.toLowerCase().includes(term.toLowerCase()),
        ),
      )
    }, 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timeout)
      reject(signal.reason)
    })
  })
}

// Mount the core Query panel into the TanStack Devtools plugin container
function queryDevtoolsPlugin(client: QueryClient): TanStackDevtoolsPlugin {
  let panel: TanstackQueryDevtoolsPanel | undefined
  return {
    name: 'TanStack Query',
    defaultOpen: true,
    render: (element, { theme }) => {
      if (!panel) {
        panel = new TanstackQueryDevtoolsPanel({
          client,
          queryFlavor: 'Lit Query',
          version: '5',
          onlineManager,
        })
        panel.mount(element)
      }
      panel.setTheme(theme)
    },
    destroy: () => {
      panel?.unmount()
      panel = undefined
    },
  }
}

class Example extends LitElement {
  static properties = {
    search: { state: true },
    requests: { state: true },
  }
  search = ''
  requests = { sent: 0, cancelled: 0 }

  // Debounce the search term, not the query function. Each debounced term
  // becomes its own query key, so Query caches every term separately.
  private debouncedSearch = createDebouncedValue(this, () => this.search, {
    key: 'Post Search Debouncer', // identifies this debouncer in the Pacer devtools
    wait: 300, // adjust this value to see the difference
  })[0]

  private get term() {
    return this.debouncedSearch().trim()
  }

  private searchQuery = createQueryController(this, () => {
    const term = this.term
    return {
      queryKey: ['posts', 'search', term],
      queryFn: ({ signal }: { signal: AbortSignal }) => {
        this.requests = { ...this.requests, sent: this.requests.sent + 1 }
        // Query aborts the signal when a newer term replaces this one
        signal.addEventListener('abort', () => {
          this.requests = {
            ...this.requests,
            cancelled: this.requests.cancelled + 1,
          }
        })
        return searchPosts(term, signal)
      },
      enabled: term.length > 0,
      // Keep showing the last results while the next term loads
      placeholderData: keepPreviousData,
    }
  })

  private devtools?: TanStackDevtoolsCore
  private target?: HTMLDivElement

  override createRenderRoot() {
    return this
  }

  override connectedCallback() {
    super.connectedCallback()
    if (!import.meta.env.DEV) return
    this.target = document.createElement('div')
    document.body.append(this.target)
    // Open the Pacer and Query panels as tabs to watch searches run
    this.devtools = new TanStackDevtoolsCore({
      plugins: [
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        queryDevtoolsPlugin(queryClient),
      ],
    })
    this.devtools.mount(this.target)
  }

  override disconnectedCallback() {
    this.devtools?.unmount()
    this.target?.remove()
    this.devtools = undefined
    this.target = undefined
    super.disconnectedCallback()
  }

  override render() {
    const term = this.term
    const searchQuery = this.searchQuery()
    const status =
      this.search !== this.debouncedSearch()
        ? 'Typing...'
        : searchQuery.isFetching
          ? 'Searching...'
          : !term
            ? 'Type to search'
            : searchQuery.isError
              ? 'Search failed'
              : `Matches for "${term}": ${searchQuery.data?.length ?? 0}`
    return html`<div
      class="App"
      style="max-width: 800px; margin: 0 auto; padding: 20px"
    >
      <h1>TanStack Pacer/Query Debounced Search Example</h1>
      <p>
        The search term is debounced, so a query only runs once you stop typing
        for 300ms. While the next results load, the previous results stay on
        screen.
      </p>
      <p>
        When a newer term replaces a search that is still running, Query cancels
        the older request through its abort signal.
      </p>
      <label style="display: block; margin-bottom: 8px">
        Search posts
        <input
          .value=${this.search}
          @input=${(event: InputEvent) =>
            (this.search = (event.target as HTMLInputElement).value)}
          placeholder="Try 'query' or 'data'"
        />
      </label>
      <p>${status}</p>
      <ul style="opacity: ${searchQuery.isPlaceholderData ? 0.5 : 1}">
        ${
          term
            ? searchQuery.data?.map((post) => html`<li>${post.title}</li>`)
            : null
        }
      </ul>
      <p>
        Requests sent: ${this.requests.sent} | Cancelled:
        ${this.requests.cancelled}
      </p>
    </div>`
  }
}
customElements.define('pacer-example', Example)
customElements.define('query-client-provider', QueryClientProvider)
const provider = new QueryClientProvider()
provider.client = queryClient
provider.append(document.createElement('pacer-example'))
document.getElementById('app')!.append(provider)
