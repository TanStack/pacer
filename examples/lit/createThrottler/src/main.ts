import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createThrottler } from '@tanstack/lit-pacer/throttler'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    throttledCount: { state: true },
  }
  instantCount = 0
  throttledCount = 0
  setCountThrottler = createThrottler(
    this,
    (value: typeof this.throttledCount) => {
      this.throttledCount = value
    },
    () => ({
      key: 'counter',
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCount.value > 2,
    }),
    (state) => state,
  )
  increment = () => {
    const nextCount = ++this.instantCount
    this.setCountThrottler.maybeExecute(nextCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottler Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>${this.setCountThrottler.state.executionCount}</td>
          </tr>
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
      <div>
        <button @click=${this.increment}>Increment</button
        ><button
          @click=${() => this.setCountThrottler.flush()}
          style="margin-left: 10px"
        >
          Flush
        </button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setCountThrottler.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    instantSearch: { state: true },
    throttledSearch: { state: true },
  }
  instantSearch = ''
  throttledSearch = ''
  setSearchThrottler = createThrottler(
    this,
    (value: typeof this.throttledSearch) => {
      this.throttledSearch = value
    },
    () => ({
      key: 'search',
      wait: 1000,
      enabled: () => this.instantSearch.length > 2,
    }),
    (state) => state,
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearch = newValue
    this.setSearchThrottler.maybeExecute(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottler Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          .value=${this.instantSearch}
          @input=${this.handleSearchChange}
          placeholder="Type to search..."
          style="width: 100%"
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>${this.setSearchThrottler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>${this.instantSearch}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>${this.throttledSearch}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click=${() => this.setSearchThrottler.flush()}>Flush</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setSearchThrottler.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    instantExecutionCount: { state: true },
    currentValue: { state: true },
    throttledValue: { state: true },
  }
  instantExecutionCount = 0
  currentValue = 50
  throttledValue = 50
  setValueThrottler = createThrottler(
    this,
    (value: typeof this.throttledValue) => {
      this.throttledValue = value
    },
    () => ({
      key: 'range',
      wait: 250,
      // leading: true, // default
      // trailing: true, // default
    }),
    (state) => state,
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    // instant state update
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // throttled state update
    this.setValueThrottler.maybeExecute(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createThrottler Example 3</h1>
      <div style="margin-bottom: 20px">
        <label
          >Current Range:<input
            type="range"
            min="0"
            max="100"
            .value=${this.currentValue}
            @input=${this.handleRangeChange}
            style="width: 100%"
          /><span>${this.currentValue}</span></label
        >
      </div>
      <div style="margin-bottom: 20px">
        <label
          >Throttled Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.throttledValue}
            disabled
            style="width: 100%"
          /><span>${this.throttledValue}</span></label
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
            <td>${this.setValueThrottler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.instantExecutionCount - this.setValueThrottler.state.executionCount}
              (${
                this.instantExecutionCount > 0
                  ? (
                      ((this.instantExecutionCount -
                        this.setValueThrottler.state.executionCount) /
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
      <div style="color: #666; font-size: 0.9em">
        <p>Throttled to 1 update per 250ms (trailing edge)</p>
      </div>
      <div>
        <button @click=${() => this.setValueThrottler.flush()}>Flush</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setValueThrottler.state, null, 2)}</pre>
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
