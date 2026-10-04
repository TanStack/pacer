import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createRateLimitedCallback } from '@tanstack/lit-pacer/rate-limiter'

class Counter extends LitElement {
  static properties = {
    windowType: { state: true },
    instantCount: { state: true },
    instantCountRef: { state: true },
    rateLimitedCount: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  instantCountRef = 0
  rateLimitedCount = 0
  rateLimitedSetCount = createRateLimitedCallback(
    this,
    (value: typeof this.rateLimitedCount) => {
      this.rateLimitedCount = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      enabled: () => this.instantCountRef > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  )
  increment = () => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    this.rateLimitedSetCount(nextCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimitedCallback Example 1</h1>
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
            <td>RateLimited Count:</td>
            <td>${this.rateLimitedCount}</td>
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
    searchText: { state: true },
    searchTextRef: { state: true },
    rateLimitedSearchText: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  searchText = ''
  searchTextRef = ''
  rateLimitedSearchText = ''
  rateLimitedSetSearch = createRateLimitedCallback(
    this,
    (value: typeof this.rateLimitedSearchText) => {
      this.rateLimitedSearchText = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      enabled: () => this.searchTextRef.length > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    this.rateLimitedSetSearch(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimitedCallback Example 2</h1>
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
            <td>RateLimited Search:</td>
            <td>${this.rateLimitedSearchText}</td>
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
    limitedValue: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  currentValue = 50
  limitedValue = 50
  rateLimitedSetValue = createRateLimitedCallback(
    this,
    (value: typeof this.limitedValue) => {
      this.limitedValue = value
    },
    () => ({
      limit: 20,
      window: 2000,
      windowType: this.windowType,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.rateLimitedSetValue(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createRateLimitedCallback Example 3</h1>
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
            .value=${this.limitedValue}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.limitedValue}</span></label
        >
      </div>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Rate limited to 20 updates per 2 seconds</p>
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
