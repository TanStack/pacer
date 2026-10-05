import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  rateLimiterOptions,
  createRateLimiter,
} from '@tanstack/lit-pacer/rate-limiter'

class Counter extends LitElement {
  static properties = {
    windowType: { state: true },
    instantCount: { state: true },
    limitedCount: { state: true },
  }
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  limitedCount = 0
  rateLimiter = createRateLimiter(
    this,
    (value: typeof this.limitedCount) => {
      this.limitedCount = value
    },
    () => ({
      key: 'counter',
      // enabled: () => instantCount.value > 2,
      ...this.commonRateLimiterOptions,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  increment = () => {
    const nextCount = ++this.instantCount
    this.rateLimiter.maybeExecute(nextCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimiter Example 1</h1>
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
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>${this.rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>${this.rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>${this.rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>${this.rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td colspan=${2}><hr /></td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>${this.limitedCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click=${this.increment}>Increment</button
        ><button @click=${() => this.rateLimiter.reset()}>Reset</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.rateLimiter.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    instantSearch: { state: true },
    limitedSearch: { state: true },
  }
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  instantSearch = ''
  limitedSearch = ''
  rateLimiter = createRateLimiter(
    this,
    (value: typeof this.limitedSearch) => {
      this.limitedSearch = value
    },
    () => ({
      key: 'search',
      enabled: () => this.instantSearch.length > 2, // optional, defaults to true
      ...this.commonRateLimiterOptions,
      // windowType: 'sliding', // default is 'fixed'
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearch = newValue
    this.rateLimiter.maybeExecute(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimiter Example 2</h1>
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
            <td>${this.rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>${this.rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>${this.rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>${this.rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td colspan=${2}><hr /></td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>${this.instantSearch}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>${this.limitedSearch}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click=${() => this.rateLimiter.reset()}>Reset</button></div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.rateLimiter.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    currentValue: { state: true },
    limitedValue: { state: true },
    instantExecutionCount: { state: true },
  }
  currentValue = 50
  limitedValue = 50
  instantExecutionCount = 0
  rateLimiter = createRateLimiter(
    this,
    (value: typeof this.limitedValue) => {
      this.limitedValue = value
    },
    () => ({
      key: 'range',
      limit: 20,
      window: 2000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.rateLimiter.maybeExecute(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimiter Example 3</h1>
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
          >Rate Limited Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.limitedValue}
            disabled
            style="width: 100%"
          /><span>${this.limitedValue}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>${this.rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>${this.rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>${this.rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>${this.rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>${this.instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.instantExecutionCount - this.rateLimiter.state.executionCount}
            </td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              ${
                this.instantExecutionCount === 0
                  ? html`${'0'}`
                  : html`${Math.round(
                      ((this.instantExecutionCount -
                        this.rateLimiter.state.executionCount) /
                        this.instantExecutionCount) *
                        100,
                    )}`
              }%
            </td>
          </tr>
        </tbody>
      </table>
      <div style="color: #666; font-size: 0.9em">
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.rateLimiter.state, null, 2)}</pre>
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
