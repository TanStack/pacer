import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { asyncRateLimit } from '@tanstack/lit-pacer/async-rate-limiter'

class Demo extends LitElement {
  static properties = {
    windowType: { state: true },
    searchText: { state: true },
    rateLimitedSearchText: { state: true },
    searchResults: { state: true },
    loading: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  searchText = ''
  rateLimitedSearchText = ''
  searchResults: Array<string> = []
  loading = false
  simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }
  private rateLimitedSetSearchWindow = this.windowType
  private rateLimitedSetSearchFunction = asyncRateLimit(
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
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer asyncRateLimit Example</h1>
      <div
        style=${styleMap({ display: 'grid', gap: '0.5rem', marginBottom: '1rem' })}
      >
        <label
          ><input
            type="radio"
            name="windowType"
            value="fixed"
            .checked=${this.windowType === 'fixed'}
            @input=${() => (this.windowType = 'fixed')}
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType"
            value="sliding"
            .checked=${this.windowType === 'sliding'}
            @input=${() => (this.windowType = 'sliding')}
          />Sliding Window</label
        >
      </div>
      <div>
        <input
          type="search"
          .value=${this.searchText}
          @input=${(e: Event) => {
            const newValue = (e.target as HTMLInputElement).value
            this.searchText = newValue
            this.rateLimitedSetSearch(newValue)
          }}
          placeholder="Type to search..."
          style=${styleMap({ width: '100%' })}
        />${this.loading ? html`<div>Loading...</div>` : nothing}
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>${this.searchText}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>${this.rateLimitedSearchText}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>Search Results:</h3>
        <ul>
          ${this.searchResults.map((result, _i) => html`<li>${result}</li>`)}
        </ul>
      </div>
    </div>`
  }
}
customElements.define('pacer-demo', Demo)
class Example extends LitElement {
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
    this.devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
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
    return html`<div><pacer-demo></pacer-demo></div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
