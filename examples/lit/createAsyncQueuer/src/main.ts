import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncQueuer } from '@tanstack/lit-pacer/async-queuer'
type Item = number
class Demo extends LitElement {
  static properties = { concurrency: { state: true } }
  fakeWaitTime = 500
  concurrency = 2
  processItem = async (item: Item): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, this.fakeWaitTime))
    console.log(`Processed ${item}`)
  }
  asyncQueuer = createAsyncQueuer(
    this,
    this.processItem,
    () => ({
      key: 'createAsyncQueuer',
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
      concurrency: this.concurrency, // Process 2 items concurrently
      started: false,
      wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
      onReject: (item, asyncQueuer) => {
        console.log(
          'Queue is full, rejecting item',
          item,
          asyncQueuer.store.state.rejectionCount,
        )
      },
      onError: (error, item: Item, asyncQueuer) => {
        console.error(
          `Error processing item: ${item}`,
          error,
          asyncQueuer.store.state.errorCount,
        ) // optionally, handle errors here instead of your own try/catch
      },
    }),
    (state) => state,
  )
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncQueuer Example</h1>
      <div></div>
      <div>Queue Size: ${this.asyncQueuer.state.size}</div>
      <div>Queue Max Size: ${25}</div>
      <div>Queue Full: ${this.asyncQueuer.state.isFull ? 'Yes' : 'No'}</div>
      <div>Queue Empty: ${this.asyncQueuer.state.isEmpty ? 'Yes' : 'No'}</div>
      <div>Queue Idle: ${this.asyncQueuer.state.isIdle ? 'Yes' : 'No'}</div>
      <div>Queuer Status: ${this.asyncQueuer.state.status}</div>
      <div>Items Processed: ${this.asyncQueuer.state.successCount}</div>
      <div>Items Rejected: ${this.asyncQueuer.state.rejectionCount}</div>
      <div>Active Tasks: ${this.asyncQueuer.state.activeItems.length}</div>
      <div>Pending Tasks: ${this.asyncQueuer.state.items.length}</div>
      <div>
        Concurrency:${' '}<input
          type="number"
          min=${1}
          .value=${this.concurrency}
          @input=${(e: Event) =>
            (this.concurrency = Math.max(
              1,
              parseInt((e.target as HTMLInputElement).value) || 1,
            ))}
          style="width: 60px"
        />
      </div>
      <div style="min-height: 250px">
        Queue
        Items:${this.asyncQueuer.peekAllItems().map((item, index) => html`<div>${index}: ${item}</div>`)}
      </div>
      <div
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
      >
        <button
          @click=${() => {
            const nextNumber = this.asyncQueuer.peekAllItems().length
              ? Math.max(...this.asyncQueuer.peekAllItems()) + 1
              : 1
            this.asyncQueuer.addItem(nextNumber)
          }}
          ?disabled=${this.asyncQueuer.state.isFull}
        >
          Add Async Task</button
        ><button @click=${() => this.asyncQueuer.getNextItem()}>
          Get Next Item</button
        ><button
          @click=${() => this.asyncQueuer.clear()}
          ?disabled=${this.asyncQueuer.state.isEmpty}
        >
          Clear Queue</button
        ><button
          @click=${() => this.asyncQueuer.flush()}
          ?disabled=${this.asyncQueuer.state.isEmpty}
        >
          Flush Queue</button
        ><button
          @click=${() => this.asyncQueuer.start()}
          ?disabled=${this.asyncQueuer.state.isRunning}
        >
          Start Processing</button
        ><button
          @click=${() => this.asyncQueuer.stop()}
          ?disabled=${!this.asyncQueuer.state.isRunning}
        >
          Stop Processing</button
        ><button @click=${() => this.asyncQueuer.reset()}>Reset Queue</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.asyncQueuer.state, null, 2)}</pre>
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
