import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { batch } from '@tanstack/lit-pacer/batcher'

class Demo extends LitElement {
  static properties = {
    processedBatches: { state: true },
    batchItems: { state: true },
  }
  processedBatches: Array<Array<number>> = []
  batchItems: Array<number> = []
  addToBatch = batch<number>(
    (items) => {
      this.processedBatches = [...this.processedBatches, items]
      console.log('Processing batch', items)
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
      onItemsChange: (batcherInstance) => {
        this.batchItems = batcherInstance.peekAllItems()
      },
    },
  )
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer batcher Example</h1>
      <div>Batch Items: ${this.batchItems.join(', ')}</div>
      <div>
        ${'Processed Batches: '}${this.processedBatches.map((b, _i) => html`<span>[${b.join(', ')}], </span>`)}
      </div>
      <button
        @click=${() => {
          const nextNumber = this.batchItems.length
            ? this.batchItems[this.batchItems.length - 1]! + 1
            : 1
          this.addToBatch(nextNumber)
        }}
      >
        Add Number
      </button>
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
