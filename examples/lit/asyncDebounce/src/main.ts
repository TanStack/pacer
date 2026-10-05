import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { asyncDebounce } from '@tanstack/lit-pacer/async-debouncer'

class Demo extends LitElement {
  static properties = {
    searchText: { state: true },
    debouncedSearchText: { state: true },
    searchResults: { state: true },
    loading: { state: true },
  }
  searchText = ''
  debouncedSearchText = ''
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
  debouncedSetSearch = asyncDebounce(
    async (value: string) => {
      try {
        this.loading = true
        this.debouncedSearchText = value
        const results = await this.simulateSearch(value)
        this.searchResults = results
      } catch (err) {
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    {
      wait: 500,
    },
  )
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer asyncDebounce Example</h1>
      <div>
        <input
          type="search"
          .value=${this.searchText}
          @input=${(e: Event) => {
            const newValue = (e.target as HTMLInputElement).value
            this.searchText = newValue
            this.debouncedSetSearch(newValue)
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
            <td>Debounced Search:</td>
            <td>${this.debouncedSearchText}</td>
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
