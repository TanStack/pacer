import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { debounce } from '@tanstack/lit-pacer/debouncer'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    debouncedCount: { state: true },
  }
  instantCount = 0
  debouncedCount = 0
  debouncedSetCount = debounce(
    (value: typeof this.debouncedCount) => (this.debouncedCount = value),
    {
      wait: 500,
      // leading: true, // optional, defaults to false
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer debounce Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>${this.debouncedCount}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click=${this.increment}>Increment</button></div>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    searchText: { state: true },
    debouncedSearchText: { state: true },
  }
  searchText = ''
  debouncedSearchText = ''
  debouncedSetSearch = debounce(
    (value: typeof this.debouncedSearchText) =>
      (this.debouncedSearchText = value),
    {
      wait: 500,
    },
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer debounce Example 2</h1>
      <div>
        <input
          type="search"
          .value=${this.searchText}
          @input=${this.handleSearchChange}
          placeholder="Type to search..."
          style=${styleMap({ width: '100%' })}
        />
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
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    instantValue: { state: true },
    debouncedValue: { state: true },
  }
  instantValue = 50
  debouncedValue = 50
  debouncedSetValue = debounce(
    (value: typeof this.debouncedValue) => (this.debouncedValue = value),
    {
      wait: 250,
    },
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.instantValue = newValue
    this.debouncedSetValue(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer debounce Example 3</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <label
          >Instant Range:<input
            type="range"
            min="0"
            max="100"
            .value=${this.instantValue}
            @input=${this.handleRangeChange}
            style=${styleMap({ width: '100%' })}
          /><span>${this.instantValue}</span></label
        >
      </div>
      <div>
        <label
          >Debounced Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.debouncedValue}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.debouncedValue}</span></label
        >
      </div>
    </div>`
  }
}
customElements.define('pacer-range', Range)
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
    return html`<div>
      <pacer-counter></pacer-counter>
      <hr />
      <pacer-search></pacer-search>
      <hr />
      <pacer-range></pacer-range>
    </div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
