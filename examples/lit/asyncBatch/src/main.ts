import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { asyncBatch } from '@tanstack/lit-pacer/async-batcher'
type Item = {
  id: number
  value: string
  timestamp: number
}
class Demo extends LitElement {
  static properties = {
    processedBatches: { state: true },
    errors: { state: true },
    pendingItems: { state: true },
    isProcessing: { state: true },
    shouldFail: { state: true },
    successCount: { state: true },
    errorCount: { state: true },
    addToBatch: { state: true },
  }
  fakeProcessingTime = 1000
  processedBatches: Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }> = []
  errors: Array<string> = []
  pendingItems: Array<Item> = []
  isProcessing = false
  shouldFail = false
  successCount = 0
  errorCount = 0
  processBatch = async (items: Array<Item>): Promise<string> => {
    console.log('Processing batch of', items.length, 'items:', items)
    this.isProcessing = true
    try {
      // Simulate async processing time
      await new Promise((resolve) =>
        setTimeout(resolve, this.fakeProcessingTime),
      )
      // Simulate occasional failures for demo purposes
      if (this.shouldFail && Math.random() < 0.3) {
        throw new Error(
          `Processing failed for batch with ${items.length} items`,
        )
      }
      // Return a result from the batch processing
      const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
      this.processedBatches = [
        ...this.processedBatches,
        { items, result, timestamp: Date.now() },
      ]
      this.successCount = this.successCount + 1
      console.log('Batch succeeded:', result)
      return result
    } catch (error: any) {
      this.errors = [
        ...this.errors,
        `Error: ${error} (${new Date().toLocaleTimeString()})`,
      ]
      this.errorCount = this.errorCount + 1
      console.error('Batch failed:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }
  addToBatch = asyncBatch<Item>(this.processBatch, {
    maxSize: 5,
    wait: 3000,
    getShouldExecute: (items) =>
      items.some((item) => item.value.includes('urgent')),
    throwOnError: false, // Don't throw errors, handle them in the processBatch function
    onItemsChange: (batcher) => {
      this.pendingItems = batcher.peekAllItems()
    },
    onSuccess: (result, batch, batcher) => {
      console.log('AsyncBatcher succeeded:', result)
      console.log('Processed batch:', batch)
      console.log('Total successful batches:', batcher.store.state.successCount)
    },
    onError: (error: any, failedItems, batcher) => {
      console.error('AsyncBatcher failed:', error)
      console.log('Failed items:', failedItems)
      console.log('Total failed batches:', batcher.store.state.errorCount)
    },
    onSettled: (batch, batcher) => {
      console.log('Batch settled:', batch)
      console.log(
        'Total processed items:',
        batcher.store.state.totalItemsProcessed,
      )
    },
  })
  addItem = (isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    this.addToBatch(item)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer asyncBatch Example</h1>
      <div>
        <h3>Batch Status</h3>
        <div>Pending Items: ${this.pendingItems.length}</div>
        <div>Max Batch Size: 5</div>
        <div>Is Processing: ${this.isProcessing ? 'Yes' : 'No'}</div>
        <div>Successful Batches: ${this.successCount}</div>
        <div>Failed Batches: ${this.errorCount}</div>
      </div>
      <div>
        <h3>Current Pending Items</h3>
        <div style=${styleMap({ minHeight: '100px' })}>
          ${this.pendingItems.length === 0 ? html`<em>No items pending</em>` : html`${this.pendingItems.map((item, index) => html`<div>${index + 1}: ${item.value} (added at${' '}${new Date(item.timestamp).toLocaleTimeString()})</div>`)}`}
        </div>
      </div>
      <div>
        <h3>Controls</h3>
        <div
          style=${styleMap({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            maxWidth: '600px',
          })}
        >
          <button @click=${() => this.addItem(false)}>Add Regular Item</button
          ><button @click=${() => this.addItem(true)}>
            Add Urgent Item (Processes Immediately)
          </button>
        </div>
        <div>
          <label
            ><input
              type="checkbox"
              .checked=${this.shouldFail}
              @input=${(e: Event) =>
                (this.shouldFail = (e.target as HTMLInputElement).checked)}
            />${' '}Simulate random failures (30% chance)</label
          >
        </div>
      </div>
      <div>
        <h3>Processed Batches (${this.processedBatches.length})</h3>
        <div>
          ${
            this.processedBatches.length === 0
              ? html`<em>No batches processed yet</em>`
              : html`${this.processedBatches.map(
                  (batch, index) =>
                    html`<div>
                      <strong>Batch ${index + 1}</strong> (processed
                      at${' '}${new Date(batch.timestamp).toLocaleTimeString()})
                      <div>${batch.result}</div>
                    </div>`,
                )}`
          }
        </div>
      </div>
      ${
        this.errors.length > 0
          ? html`<div>
              <h3>Errors (${this.errors.length})</h3>
              <div>
                ${this.errors.map((error, _index) => html`<div>${error}</div>`)}
              </div>
              <button @click=${() => (this.errors = [])}>Clear Errors</button>
            </div>`
          : nothing
      }
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
    return html`<div><pacer-demo></pacer-demo></div>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
