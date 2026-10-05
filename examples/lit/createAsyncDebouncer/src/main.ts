import { LitElement, html, nothing } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncDebouncer } from '@tanstack/lit-pacer/async-debouncer'
interface SearchResult {
  id: number
  title: string
}
class Demo extends LitElement {
  static properties = { searchTerm: { state: true }, results: { state: true } }
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  searchTerm = ''
  results: Array<SearchResult> = []
  handleSearch = async (term: string) => {
    if (!term) {
      this.results = []
      return
    }
    // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
    const data = await this.fakeApi(term)
    this.results = data
    return data // this could alternatively be a void function without a return
  }
  asyncDebouncer = createAsyncDebouncer(
    this,
    this.handleSearch,
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
  handleSearchDebounced = this.asyncDebouncer.maybeExecute
  onSearchChange = async (e: Event) => {
    const newTerm = (e.target as HTMLInputElement).value
    this.searchTerm = newTerm
    const result = await this.handleSearchDebounced(newTerm) // optionally await result if you need to
    console.log('result', result)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncDebouncer Example</h1>
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
        <button @click=${() => this.asyncDebouncer.flush()}>Flush</button>
      </div>
      <div>
        <p>API calls made: ${this.asyncDebouncer.state.successCount}</p>
        ${
          this.results.length > 0
            ? html`<ul>
                ${this.results.map((item) => html`<li>${item.title}</li>`)}
              </ul>`
            : nothing
        }${this.asyncDebouncer.state.isPending ? html`<p>Pending...</p>` : nothing}${this.asyncDebouncer.state.isExecuting ? html`<p>Executing...</p>` : nothing}
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.asyncDebouncer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-demo', Demo)
class Example extends LitElement {
  static properties = { mounted: { state: true } }
  mounted = true
  toggleMounted = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Enter') this.mounted = !this.mounted
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
