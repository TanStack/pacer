import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createThrottledState } from '@tanstack/lit-pacer/throttler'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    instantCountRef: { state: true },
  }
  instantCount = 0
  instantCountRef = 0
  throttlerResult = createThrottledState(
    this,
    this.instantCount,
    () => ({
      wait: 1000,
      // enabled: () => this.instantCountRef > 2, // optional, defaults to true
    }),
    (state) => state,
  )
  throttledCount = this.throttlerResult[0]
  setThrottledCount = this.throttlerResult[1]
  throttler = this.throttlerResult[2]
  increment = () => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.setThrottledCount(nextCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledState Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>${this.throttler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>${this.throttledCount()}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click=${this.increment}>Increment</button></div>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.throttler.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    instantSearch: { state: true },
    instantSearchRef: { state: true },
  }
  instantSearch = ''
  instantSearchRef = ''
  throttlerResult = createThrottledState(
    this,
    this.instantSearch,
    () => ({
      wait: 1000,
      // enabled: () => this.instantSearchRef.length > 2, // optional, defaults to true
    }),
    (state) => state,
  )
  throttledSearch = this.throttlerResult[0]
  setThrottledSearch = this.throttlerResult[1]
  throttler = this.throttlerResult[2]
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    this.setThrottledSearch(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledState Example 2</h1>
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
            <td>Execution Count:</td>
            <td>${this.throttler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>${this.instantSearch}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>${this.throttledSearch()}</td>
          </tr>
        </tbody>
      </table>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.throttler.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    instantExecutionCount: { state: true },
    currentValue: { state: true },
  }
  instantExecutionCount = 0
  currentValue = 50
  throttlerResult = createThrottledState(
    this,
    this.currentValue,
    () => ({
      wait: 250,
    }),
    (state) => state,
  )
  throttledValue = this.throttlerResult[0]
  setThrottledValue = this.throttlerResult[1]
  throttler = this.throttlerResult[2]
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.setThrottledValue(newValue)
    this.instantExecutionCount = this.instantExecutionCount + 1
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottledState Example 3</h1>
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
            .value=${this.throttledValue()}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.throttledValue()}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Execution Count:</td>
            <td>${this.instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Throttled Execution Count:</td>
            <td>${this.throttler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.instantExecutionCount - this.throttler.state.executionCount}
              (${
                this.instantExecutionCount > 0
                  ? (
                      ((this.instantExecutionCount -
                        this.throttler.state.executionCount) /
                        this.instantExecutionCount) *
                      100
                    ).toFixed(2)
                  : 0
              }%
              Reduction in execution calls)
            </td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Throttled to 1 update per 250ms</p>
      </div>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.throttler.state, null, 2)}</pre>
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
