import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { queue } from '@tanstack/lit-pacer/queuer'

class Counter extends LitElement {
  static properties = {
    queueItems: { state: true },
    processedCount: { state: true },
  }
  queueItems: Array<number> = []
  processedCount = 0
  processQueueItem = (item: number) => {
    console.log('Processing item:', item)
  }
  queueItem = queue<number>(this.processQueueItem, {
    key: 'Add Number Queue',
    maxSize: 25,
    wait: 1000,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer queue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>${this.queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>${this.processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>${this.queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
      <button
        @click=${() => {
          const nextNumber = this.queueItems.length
            ? this.queueItems[this.queueItems.length - 1]! + 1
            : 1
          this.queueItem(nextNumber)
        }}
        ?disabled=${this.queueItems.length >= 25}
      >
        Add Number
      </button>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    queueItems: { state: true },
    processedCount: { state: true },
    inputText: { state: true },
    queuedText: { state: true },
  }
  queueItems: Array<string> = []
  processedCount = 0
  inputText = ''
  queuedText = ''
  processQueueItem = (item: string) => {
    this.queuedText = item
  }
  queueTextChange = queue<string>(this.processQueueItem, {
    key: 'Text Change Queue',
    maxSize: 100,
    wait: 500,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  handleInputChange = (e: Event) => {
    this.inputText = (e.target as HTMLInputElement).value
    this.queueTextChange((e.target as HTMLInputElement).value)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer queue Example 2</h1>
      <div>
        <input
          type="search"
          .value=${this.inputText}
          @input=${this.handleInputChange}
          placeholder="Type to add to queue..."
          style=${styleMap({ width: '100%' })}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queued Text:</td>
            <td>${this.queuedText}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>${this.queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>${this.processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>${this.queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    queueItems: { state: true },
    processedCount: { state: true },
    currentValue: { state: true },
    queuedValue: { state: true },
  }
  queueItems: Array<number> = []
  processedCount = 0
  currentValue = 50
  queuedValue = 50
  processQueueItem = (item: number) => {
    this.queuedValue = item
  }
  queueValue = queue<number>(this.processQueueItem, {
    key: 'Range Change Queue',
    maxSize: 100,
    wait: 100,
    onItemsChange: (queue) => {
      this.queueItems = queue.peekAllItems()
    },
    onExecute: (_item, queue) => {
      this.processedCount = queue.store.state.executionCount
    },
  })
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.queueValue(newValue)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer queue Example 3</h1>
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
            .value=${this.queuedValue}
            disabled
            style=${styleMap({ width: '100%' })}
          /><span>${this.queuedValue}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Queue Size:</td>
            <td>${this.queueItems.length}</td>
          </tr>
          <tr>
            <td>Items Processed:</td>
            <td>${this.processedCount}</td>
          </tr>
          <tr>
            <td>Queue Items:</td>
            <td>${this.queueItems.join(', ')}</td>
          </tr>
        </tbody>
      </table>
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
