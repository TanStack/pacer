import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createThrottledCallback } from '@tanstack/lit-pacer/throttler'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    instantCountRef: { state: true },
    throttledCount: { state: true },
  }
  instantCount = 0
  instantCountRef = 0
  throttledCount = 0
  throttledSetCount = createThrottledCallback(
    this,
    (value: typeof this.throttledCount) => {
      this.throttledCount = value
    },
    () => ({
      wait: 1000,
      enabled: () => this.instantCountRef > 2,
    }),
  )
  increment = () => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.throttledSetCount(nextCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledCallback Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>${this.throttledCount}</td>
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
    searchTextRef: { state: true },
    throttledSearchText: { state: true },
  }
  searchText = ''
  searchTextRef = ''
  throttledSearchText = ''
  throttledSetSearch = createThrottledCallback(
    this,
    (value: typeof this.throttledSearchText) => {
      this.throttledSearchText = value
    },
    () => ({
      wait: 1000,
      enabled: () => this.searchTextRef.length > 2,
    }),
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    this.throttledSetSearch(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledCallback Example 2</h1>
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
            <td>Throttled Search:</td>
            <td>${this.throttledSearchText}</td>
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
    throttledValue: { state: true },
  }
  currentValue = 50
  throttledValue = 50
  throttledSetValue = createThrottledCallback(
    this,
    (value: typeof this.throttledValue) => {
      this.throttledValue = value
    },
    () => ({
      wait: 250,
    }),
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.throttledSetValue(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledCallback Example 3</h1>
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
          >Throttled Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.throttledValue}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.throttledValue}</span></label
        >
      </div>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Throttled to 1 update per 250ms</p>
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
