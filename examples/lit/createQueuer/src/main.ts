import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createQueuer } from '@tanstack/lit-pacer/queuer'

class Counter extends LitElement {
  static properties = {}
  processItem = (item: number) => {
    console.log('processing item', item)
  }
  queuer = createQueuer(
    this,
    this.processItem,
    () => ({
      key: 'Add Number Queue',
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSize: 25, // optional, defaults to Infinity
      started: false, // optional, defaults to true
      wait: 1000, // wait 1 second between processing items - wait is optional!
    }),
    (state) => state,
  )
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createQueuer Example 1</h1>
      <div>Queue Size: ${this.queuer.state.size}</div>
      <div>Queue Max Size: ${25}</div>
      <div>Queue Full: ${this.queuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Peek: ${this.queuer.peekNextItem()}</div>
      <div>Queue Empty: ${this.queuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: ${this.queuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: ${this.queuer.state.status}</div>
      <div>Items Processed: ${this.queuer.state.executionCount}</div>
      <div>Queue Items: ${this.queuer.state.items.join(', ')}</div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          @click=${() => {
            const nextNumber = this.queuer.state.items.length
              ? this.queuer.state.items[this.queuer.state.items.length - 1]! + 1
              : 1
            this.queuer.addItem(nextNumber)
          }}
          ?disabled=${this.queuer.state.isFull}
        >
          Add Number</button
        ><button
          ?disabled=${this.queuer.state.isEmpty}
          @click=${() => {
            const item = this.queuer.execute()
            console.log('getNextItem item', item)
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
          Stop Processing</button
        ><button
          @click=${() => this.queuer.flush()}
          ?disabled=${this.queuer.state.isEmpty}
        >
          Flush Queue
        </button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.queuer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Range extends LitElement {
  static properties = {
    currentValue: { state: true },
    queuedValue: { state: true },
    submittedCount: { state: true },
  }
  currentValue = 50
  queuedValue = 50
  submittedCount = 1
  processItem = (item: number) => {
    this.queuedValue = item
  }
  queuer = createQueuer(
    this,
    this.processItem,
    () => ({
      key: 'Range Queue',
      maxSize: 100,
      initialItems: [this.currentValue],
      wait: 100,
    }),
    (state) => state,
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    this.queuer.addItem(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createQueuer Example 2</h1>
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
          >Queued Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.queuedValue}
            disabled
            style="width: 100%"
          /><span>${this.queuedValue}</span></label
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
            <td>${this.queuer.state.isRunning ? 'Running' : 'Stopped'}</td>
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
      <div style="color: #666; font-size: 0.9em">
        <p>Queued with 100ms wait time</p>
      </div>
      <div>
        <button @click=${() => this.queuer.flush()}>Flush Queue</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.queuer.state, null, 2)}</pre>
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
      <pacer-range></pacer-range>
    </div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
