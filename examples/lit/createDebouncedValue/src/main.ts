import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createDebouncedValue } from '@tanstack/lit-pacer/debouncer'

class Counter extends LitElement {
  static properties = { instantCount: { state: true } }
  instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  debouncedCountResult = createDebouncedValue(
    this,
    () => this.instantCount,
    () => ({
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    }),
    (state) => state,
  )
  debouncedCount = this.debouncedCountResult[0]
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>${this.debouncedCount()}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click=${this.increment}>Increment</button></div>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = { instantSearch: { state: true } }
  instantSearch = ''
  debouncedSearchResult = createDebouncedValue(
    this,
    () => this.instantSearch,
    () => ({
      wait: 500,
      enabled: this.instantSearch.length > 2, // optional, defaults to true
    }),
    (state) => state,
  )
  debouncedSearch = this.debouncedSearchResult[0]
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncedValue Example 2</h1>
      <div>
        <input
          type="search"
          .value=${this.instantSearch}
          @input=${this.handleSearchChange}
          placeholder="Type to search..."
          style=${styleMap({ width: '100%' })}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>${this.instantSearch}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>${this.debouncedSearch()}</td>
          </tr>
        </tbody>
      </table>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    currentValue: { state: true },
    submittedCount: { state: true },
  }
  currentValue = 50
  submittedCount = 1
  debouncerResult = createDebouncedValue(
    this,
    () => this.currentValue,
    () => ({
      wait: 250,
    }),
    (state) => state,
  )
  debouncedValue = this.debouncerResult[0]
  debouncer = this.debouncerResult[1]
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncedValue Example 3</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <label
          >Current Range:<input
            type="range"
            min="0"
            max="100"
            .value=${this.currentValue}
            @input=${this.handleRangeChange}
            style=${styleMap({ width: '100%' })}
          /><span>${this.currentValue}</span></label
        >
      </div>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <label
          >Debounced Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.debouncedValue()}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.debouncedValue()}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Is Pending:</td>
            <td>${this.debouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Values Submitted:</td>
            <td>${this.submittedCount}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>${this.debouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.submittedCount - this.debouncer.state.executionCount}
            </td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              ${
                this.submittedCount === 0
                  ? html`${'0'}`
                  : html`${Math.round(
                      ((this.submittedCount -
                        this.debouncer.state.executionCount) /
                        this.submittedCount) *
                        100,
                    )}`
              }%
            </td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Debounced to 250ms wait time</p>
      </div>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.debouncer.state, null, 2)}</pre>
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
