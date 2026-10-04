import { LitElement, html, nothing } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncRateLimiter } from '@tanstack/lit-pacer/async-rate-limiter'
interface SearchResult {
  id: number
  title: string
}
class Demo extends LitElement {
  static properties = {
    windowType: { state: true },
    searchTerm: { state: true },
    results: { state: true },
    error: { state: true },
  }
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  searchTerm = ''
  results: Array<SearchResult> = []
  error: Error | null = null
  handleSearch = async (term: string) => {
    if (!term) {
      this.results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await this.fakeApi(term)
    this.results = data
    this.error = null
  }
  setSearchAsyncRateLimiter = createAsyncRateLimiter(
    this,
    this.handleSearch,
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
  handleSearchRateLimited = this.setSearchAsyncRateLimiter.maybeExecute
  override disconnectedCallback() {
    super.disconnectedCallback()
    ;(() => {
      console.log('unmount')
      this.setSearchAsyncRateLimiter.reset() // cancel any pending async calls when the component unmounts
    })()
  }
  onSearchChange = async (e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    await this.handleSearchRateLimited(newTerm) // optionally await if you need to
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncRateLimiter Example</h1>
      <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
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
          autofocus
          type="search"
          .value=${this.searchTerm}
          @input=${this.onSearchChange}
          placeholder="Type to search..."
          style="width: 100%"
          autocomplete="new-password"
        />
      </div>
      ${this.error ? html`<div>Error: ${this.error.message}</div>` : nothing}
      <div>
        <table>
          <tbody>
            <tr>
              <td>API calls made:</td>
              <td>${this.setSearchAsyncRateLimiter.state.successCount}</td>
            </tr>
            <tr>
              <td>Rejected calls:</td>
              <td>${this.setSearchAsyncRateLimiter.state.rejectionCount}</td>
            </tr>
            <tr>
              <td>Is executing:</td>
              <td>
                ${this.setSearchAsyncRateLimiter.state.isExecuting ? 'Yes' : 'No'}
              </td>
            </tr>
            <tr>
              <td>Results:</td>
              <td>
                ${
                  this.results.length > 0
                    ? html`<ul>
                        ${this.results.map((item) => html`<li>${item.title}</li>`)}
                      </ul>`
                    : html`${'No results'}`
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setSearchAsyncRateLimiter.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-demo', Demo)
class Example extends LitElement {
  static properties = { mounted: { state: true } }
  mounted = true
  toggleMounted = (event: KeyboardEvent) => {
    if (event.key === 'Enter') this.mounted = !this.mounted
  }
  private devtools?: TanStackDevtoolsCore
  private target?: HTMLDivElement
  override createRenderRoot() {
    return this
  }
  override connectedCallback() {
    super.connectedCallback()
    document.addEventListener('keydown', this.toggleMounted)
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
    document.removeEventListener('keydown', this.toggleMounted)
    super.disconnectedCallback()
  }
  override render() {
    return html`${this.mounted ? html`<div><pacer-demo></pacer-demo></div>` : nothing}`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
