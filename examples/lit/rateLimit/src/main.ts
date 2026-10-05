import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { rateLimit } from '@tanstack/lit-pacer/rate-limiter'

class Counter extends LitElement {
  static properties = {
    windowType: { state: true },
    instantCount: { state: true },
    rateLimitedCount: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  rateLimitedCount = 0
  private rateLimitedSetCountWindow = this.windowType
  private rateLimitedSetCountFunction = rateLimit(
    (value: typeof this.rateLimitedCount) => (this.rateLimitedCount = value),
    {
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )
  get rateLimitedSetCount() {
    if (this.rateLimitedSetCountWindow !== this.windowType) {
      this.rateLimitedSetCountWindow = this.windowType
      this.rateLimitedSetCountFunction = rateLimit(
        (value: typeof this.rateLimitedCount) =>
          (this.rateLimitedCount = value),
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetCountFunction
  }
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer rateLimit Example 1</h1>
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
    text: { state: true },
    rateLimitedText: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  text = ''
  rateLimitedText = ''
  private rateLimitedSetTextWindow = this.windowType
  private rateLimitedSetTextFunction = rateLimit(
    (value: typeof this.rateLimitedText) => (this.rateLimitedText = value),
    {
      limit: 5,
      window: 5000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )
  get rateLimitedSetText() {
    if (this.rateLimitedSetTextWindow !== this.windowType) {
      this.rateLimitedSetTextWindow = this.windowType
      this.rateLimitedSetTextFunction = rateLimit(
        (value: typeof this.rateLimitedText) => (this.rateLimitedText = value),
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetTextFunction
  }
  handleTextChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.rateLimitedSetText(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer rateLimit Example 2</h1>
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
          .value=${this.text}
          @input=${this.handleTextChange}
          placeholder="Type text (rate limited to 5 updates per 5 seconds)..."
          style=${styleMap({ width: '100%' })}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>${this.text}</td>
          </tr>
          <tr>
            <td>Rate Limited Text:</td>
            <td>${this.rateLimitedText}</td>
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
    rateLimitedValue: { state: true },
  }
  windowType: 'fixed' | 'sliding' = 'fixed'
  currentValue = 50
  rateLimitedValue = 50
  private rateLimitedSetValueWindow = this.windowType
  private rateLimitedSetValueFunction = rateLimit(
    (value: typeof this.rateLimitedValue) => (this.rateLimitedValue = value),
    {
      limit: 30,
      window: 2000,
      windowType: this.windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )
  get rateLimitedSetValue() {
    if (this.rateLimitedSetValueWindow !== this.windowType) {
      this.rateLimitedSetValueWindow = this.windowType
      this.rateLimitedSetValueFunction = rateLimit(
        (value: typeof this.rateLimitedValue) =>
          (this.rateLimitedValue = value),
        {
          limit: 30,
          window: 2000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetValueFunction
  }
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
      <h1>TanStack Pacer rateLimit Example 3</h1>
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
            .value=${this.rateLimitedValue}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.rateLimitedValue}</span></label
        >
      </div>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Rate limited to 30 updates per 2000ms window</p>
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
