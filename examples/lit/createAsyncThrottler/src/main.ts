import { LitElement, html, nothing } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncThrottler } from '@tanstack/lit-pacer/async-throttler'
interface SearchResult {
  id: number
  title: string
}
class Demo extends LitElement {
  static properties = {
    searchTerm: { state: true },
    results: { state: true },
    error: { state: true },
  }
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
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
    return data // this could alternatively be a void function without a return
  }
  setSearchAsyncThrottler = createAsyncThrottler(
    this,
    this.handleSearch,
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
  handleSearchThrottled = this.setSearchAsyncThrottler.maybeExecute
  onSearchChange = async (e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    const result = await this.handleSearchThrottled(newTerm) // optionally await if you need to
    console.log('result', result)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncThrottler Example</h1>
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
      <div style="margin-top: 10px">
        <button @click=${() => this.setSearchAsyncThrottler.flush()}>
          Flush
        </button>
      </div>
      ${this.error ? html`<div>Error: ${this.error.message}</div>` : nothing}
      <div>
        <p>
          API calls made: ${this.setSearchAsyncThrottler.state.successCount}
        </p>
        ${
          this.results.length > 0
            ? html`<ul>
                ${this.results.map((item) => html`<li>${item.title}</li>`)}
              </ul>`
            : nothing
        }${this.setSearchAsyncThrottler.state.isPending ? html`<p>Pending...</p>` : html`${this.setSearchAsyncThrottler.state.isExecuting ? html`<p>Executing...</p>` : html``}`}
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setSearchAsyncThrottler.state, null, 2)}</pre>
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
