import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createRateLimitedValue } from '@tanstack/lit-pacer/rate-limiter'

class Counter extends LitElement {
  static properties = {
    windowType: { state: true },
    instantCount: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  limitedCountResult = createRateLimitedValue(
    this,
    () => this.instantCount,
    () => ({
      // enabled: () => instantCount > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  limitedCount = this.limitedCountResult[0]
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimitedValue Example 1</h1>
      <div
        style=${styleMap({ display: 'grid', gap: '0.5rem', marginBottom: '1rem' })}
      >
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
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>${this.limitedCount()}</td>
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
    windowType: { state: true },
    instantSearch: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantSearch = ''
  limitedSearchResult = createRateLimitedValue(
    this,
    () => this.instantSearch,
    () => ({
      // enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  limitedSearch = this.limitedSearchResult[0]
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimitedValue Example 2</h1>
      <div
        style=${styleMap({ display: 'grid', gap: '0.5rem', marginBottom: '1rem' })}
      >
        <label
          ><input
            type="radio"
            name="windowType2"
            value="fixed"
            .checked=${this.windowType === 'fixed'}
            @input=${() => (this.windowType = 'fixed')}
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType2"
            value="sliding"
            .checked=${this.windowType === 'sliding'}
            @input=${() => (this.windowType = 'sliding')}
          />Sliding Window</label
        >
      </div>
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
            <td>Rate Limited Search:</td>
            <td>${this.limitedSearch()}</td>
          </tr>
        </tbody>
      </table>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    windowType: { state: true },
    currentValue: { state: true },
    submittedCount: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  currentValue = 50
  submittedCount = 1
  rateLimiterResult = createRateLimitedValue(
    this,
    () => this.currentValue,
    () => ({
      limit: 20,
      window: 2000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    (state) => state,
  )
  limitedValue = this.rateLimiterResult[0]
  rateLimiter = this.rateLimiterResult[1]
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
      <h1>TanStack Pacer createRateLimitedValue Example 3</h1>
      <div
        style=${styleMap({ display: 'grid', gap: '0.5rem', marginBottom: '1rem' })}
      >
        <label
          ><input
            type="radio"
            name="windowType3"
            value="fixed"
            .checked=${this.windowType === 'fixed'}
            @input=${() => (this.windowType = 'fixed')}
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType3"
            value="sliding"
            .checked=${this.windowType === 'sliding'}
            @input=${() => (this.windowType = 'sliding')}
          />Sliding Window</label
        >
      </div>
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
          >Rate Limited Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.limitedValue()}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.limitedValue()}</span></label
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
            <td>Values Submitted:</td>
            <td>${this.submittedCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.submittedCount - this.rateLimiter.state.executionCount}
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
                        this.rateLimiter.state.executionCount) /
                        this.submittedCount) *
                        100,
                    )}`
              }%
            </td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <pre style=${styleMap({ marginTop: '20px' })}>
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
