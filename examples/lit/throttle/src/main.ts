import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { throttle } from '@tanstack/lit-pacer/throttler'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    throttledCount: { state: true },
  }
  instantCount = 0
  throttledCount = 0
  throttledSetCount = throttle(
    (value: typeof this.throttledCount) => (this.throttledCount = value),
    {
      wait: 1000,
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer throttle Example 1</h1>
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
  static properties = { text: { state: true }, throttledText: { state: true } }
  text = ''
  throttledText = ''
  throttledSetText = throttle(
    (value: typeof this.throttledText) => (this.throttledText = value),
    {
      wait: 1000,
    },
  )
  handleTextChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.throttledSetText(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer throttle Example 2</h1>
      <div>
        <input
          type="search"
          .value=${this.text}
          @input=${this.handleTextChange}
          placeholder="Type text (throttled to 1 update per second)..."
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
            <td>Throttled Text:</td>
            <td>${this.throttledText}</td>
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
    instantExecutionCount: { state: true },
  }
  currentValue = 50
  throttledValue = 50
  instantExecutionCount = 0
  throttledSetValue = throttle(
    (value: typeof this.throttledValue) => (this.throttledValue = value),
    {
      wait: 250,
    },
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.throttledSetValue(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer throttle Example 3</h1>
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
      <table>
        <tbody>
          <tr>
            <td>Instant Executions:</td>
            <td>${this.instantExecutionCount}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Throttled with 250ms wait time</p>
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
