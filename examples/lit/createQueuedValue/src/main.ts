import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createQueuedValue } from '@tanstack/lit-pacer/queuer'

class Counter extends LitElement {
  static properties = { instantSearchValue: { state: true } }
  instantSearchValue = ''
  queuerResult = createQueuedValue(
    this,
    () => this.instantSearchValue,
    () => ({
      maxSize: 25,
      wait: 500, // wait 500ms between processing value changes
    }),
    (state) => state,
  )
  value = this.queuerResult[0]
  queuer = this.queuerResult[1]
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createQueuedValue Example 1</h1>
      <div>Current Value: ${this.value()}</div>
      <hr />
      <div>Queue Size: ${this.queuer.state.size}</div>
      <div>Queue Full: ${this.queuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: ${this.queuer.peekNextItem()}</div>
      <div>Queue Empty: ${this.queuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: ${this.queuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: ${this.queuer.state.status}</div>
      <div>Items Processed: ${this.queuer.state.executionCount}</div>
      <div>Queue Items: ${this.queuer.peekAllItems().join(', ')}</div>
      <div
        style=${styleMap({
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          maxWidth: '600px',
          margin: '16px 0',
        })}
      >
        <input
          type="search"
          .value=${this.instantSearchValue}
          @input=${(e: Event) => {
            this.instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search value
          }}
          placeholder="Enter search term..."
          ?disabled=${this.queuer.state.isFull}
        /><button
          ?disabled=${this.queuer.state.isEmpty}
          @click=${() => {
            this.queuer.execute()
          }}
        >
          Process Next</button
        ><button
          @click=${() => this.queuer.clear()}
          ?disabled=${this.queuer.state.isEmpty}
        >
          Clear Queue</button
        ><button
          @click=${() => this.queuer.reset()}
          ?disabled=${this.queuer.state.isEmpty}
        >
          Reset Queue</button
        ><button
          @click=${() => this.queuer.start()}
          ?disabled=${this.queuer.state.isRunning}
        >
          Start Processing</button
        ><button
          @click=${() => this.queuer.stop()}
          ?disabled=${!this.queuer.state.isRunning}
        >
          Stop Processing
        </button>
      </div>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.queuer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    currentValue: { state: true },
    submittedCount: { state: true },
  }
  currentValue = 50
  submittedCount = 1
  queuerResult = createQueuedValue(
    this,
    () => this.currentValue,
    () => ({
      maxSize: 100,
      wait: 100,
    }),
    (state) => state,
  )
  queuedValue = this.queuerResult[0]
  queuer = this.queuerResult[1]
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
      <h1>TanStack Pacer createQueuedValue Example 2</h1>
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
          >Queued Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.queuedValue()}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.queuedValue()}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>${this.queuer.state.size}</td>
          </tr>
          <tr>
            <td>Queue Full:</td>
            <td>${this.queuer.state.isFull ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Empty:</td>
            <td>${this.queuer.state.isEmpty ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queue Idle:</td>
            <td>${this.queuer.state.isIdle ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Queuer Status:</td>
            <td>${this.queuer.state.status}</td>
          </tr>
          <tr>
            <td>Values Submitted:</td>
            <td>${this.submittedCount}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>${this.queuer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Pending Items:</td>
            <td>${this.queuer.state.size}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ color: '#666', fontSize: '0.9em' })}>
        <p>Queued with 100ms wait time</p>
      </div>
      <pre style=${styleMap({ marginTop: '20px' })}>
${JSON.stringify(this.queuer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-search', Search)
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
    </div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
