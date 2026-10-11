import { LitElement, html, nothing } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncBatcher } from '@tanstack/lit-pacer/async-batcher'
type Item = {
  id: number
  value: string
  timestamp: number
}
class Demo extends LitElement {
  static properties = {
    processedBatches: { state: true },
    errors: { state: true },
  }
  fakeProcessingTime = 1000
  processedBatches: Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }> = []
  errors: Array<string> = []
  processBatch = async (items: Array<Item>): Promise<string> => {
    console.log('Processing batch of', items.length, 'items:', items)
    // Simulate async processing time
    await new Promise((resolve) => setTimeout(resolve, this.fakeProcessingTime))
    // Simulate occasional failures for demo purposes
    // throw new Error(`Processing failed for batch with ${items.length} items`)
    // Return a result from the batch processing
    const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
    this.processedBatches = [
      ...this.processedBatches,
      { items, result, timestamp: Date.now() },
    ]
    return result
  }
  asyncBatcher = createAsyncBatcher(
    this,
    this.processBatch,
    () => ({
      key: 'createAsyncBatcher',
      maxSize: 5, // Process in batches of 5 (if reached before wait time)
      wait: 4000, // Wait up to 4 seconds before processing a batch
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
      throwOnError: false, // Don't throw errors, handle them via onError
      onSuccess: (result, batch, batcher) => {
        console.log('Batch succeeded:', result)
        console.log('Processed batch:', batch)
        console.log(
          'Total successful batches:',
          batcher.store.state.successCount,
        )
      },
      onError: (error: any, _batcher) => {
        console.error('Batch failed:', error)
        this.errors = [
          ...this.errors,
          `Error: ${error} (${new Date().toLocaleTimeString()})`,
        ]
      },
      onSettled: (batch, batcher) => {
        console.log('Batch settled:', batch)
        console.log(
          'Total processed items:',
          batcher.store.state.totalItemsProcessed,
        )
      },
    }),
    (state) => state,
  )
  addItem = (isUrgent = false) => {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    this.asyncBatcher.addItem(item)
  }
  executeCurrentBatch = async () => {
    try {
      const result = await this.asyncBatcher.flush()
      console.log('Manual execution result:', result)
    } catch (error) {
      console.error('Manual execution failed:', error)
    }
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncBatcher Example</h1>
      <div>
        <h3>Batch Status</h3>
        <div>Current Batch Size: ${this.asyncBatcher.state.size}</div>
        <div>Max Batch Size: 5</div>
        <div>
          Is Executing: ${this.asyncBatcher.state.isExecuting ? 'Yes' : 'No'}
        </div>
        <div>Status: ${this.asyncBatcher.state.status}</div>
        <div>Successful Batches: ${this.asyncBatcher.state.successCount}</div>
        <div>Failed Batches: ${this.asyncBatcher.state.errorCount}</div>
        <div>
          Total Items Processed: ${this.asyncBatcher.state.totalItemsProcessed}
        </div>
      </div>
      <div>
        <h3>Current Batch Items</h3>
        <div style="min-height: 100px">
          ${this.asyncBatcher.state.items.length === 0 ? html`<em>No items in current batch</em>` : html`${this.asyncBatcher.state.items.map((item, index) => html`<div>${index + 1}: ${item.value} (added at${' '}${new Date(item.timestamp).toLocaleTimeString()})</div>`)}`}
        </div>
      </div>
      <div>
        <h3>Controls</h3>
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px"
        >
          <button @click=${() => this.addItem(false)}>Add Regular Item</button
          ><button @click=${() => this.addItem(true)}>
            Add Urgent Item (Processes Immediately)</button
          ><button
            ?disabled=${this.asyncBatcher.state.size === 0 || this.asyncBatcher.state.isExecuting}
            @click=${this.executeCurrentBatch}
          >
            Process Current Batch Now</button
          ><button
            @click=${() => this.asyncBatcher.clear()}
            ?disabled=${this.asyncBatcher.state.size === 0 || this.asyncBatcher.state.isExecuting}
          >
            Clear Current Batch
          </button>
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
                ${this.errors.map((error) => html`<div>${error}</div>`)}
              </div>
              <button @click=${() => (this.errors = [])}>Clear Errors</button>
            </div>`
          : nothing
      }
      <pre style="margin-top: 20px">
${JSON.stringify(this.asyncBatcher.state, null, 2)}</pre>
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
