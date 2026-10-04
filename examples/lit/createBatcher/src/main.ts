import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createBatcher } from '@tanstack/lit-pacer/batcher'

class Demo extends LitElement {
  static properties = { processedBatches: { state: true } }
  processedBatches: Array<Array<number>> = []
  processBatch = (items: Array<number>) => {
    this.processedBatches = [...this.processedBatches, items]
    console.log('processing batch', items)
  }
  batcher = createBatcher(
    this,
    this.processBatch,
    () => ({
      key: 'createBatcher',
      // started: false, // true by default
      maxSize: 5, // Process in batches of 5 (if comes before wait time)
      wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
      getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
    }),
    (state) => state,
  )
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createBatcher Example 1</h1>
      <div>Batch Size: ${this.batcher.state.size}</div>
      <div>Batch Max Size: ${5}</div>
      <div>Batch Items: ${this.batcher.peekAllItems().join(', ')}</div>
      <div>Batches Processed: ${this.batcher.state.executionCount}</div>
      <div>Items Processed: ${this.batcher.state.totalItemsProcessed}</div>
      <div>
        Processed
        Batches:${' '}${this.processedBatches.map((b) => html`<span>[${b.join(', ')}]</span>,${' '}`)}
      </div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          @click=${() => {
            const nextNumber = this.batcher.peekAllItems().length
              ? this.batcher.peekAllItems()[
                  this.batcher.peekAllItems().length - 1
                ]! + 1
              : 1
            this.batcher.addItem(nextNumber)
          }}
        >
          Add Number</button
        ><button
          ?disabled=${this.batcher.state.size === 0}
          @click=${() => {
            this.batcher.flush()
          }}
        >
          Flush Current Batch
        </button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.batcher.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-demo', Demo)
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
      <pacer-demo></pacer-demo>
      <hr />
    </div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
