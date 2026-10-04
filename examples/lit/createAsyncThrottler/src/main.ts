import { LitElement, html } from 'lit'
import { createAsyncThrottler } from '@tanstack/lit-pacer'
import './style.css'
class Example extends LitElement {
  static properties = {
    input: { state: true },
    wait: { state: true },
    history: { state: true },
  }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createAsyncThrottler(
    this,
    async (value: string) => {
      this.history = [...this.history, value]
    },
    () => ({ wait: this.wait, leading: false }),
    (state) => state,
  )
  override createRenderRoot() {
    return this
  }
  schedule = () => {
    void this.utility.maybeExecute(this.input)
  }
  burst = () => {
    for (let i = 1; i <= 3; i++)
      void this.utility.maybeExecute(`${this.input} ${i}`)
  }
  override render() {
    return html` <main>
      <h1>Lit createAsyncThrottler</h1>
      <p>
        Limit executions to one per interval while retaining the latest trailing
        call.
      </p>
      <label
        >Task
        <input
          .value=${this.input}
          @input=${(event: Event) => {
            this.input = (event.target as HTMLInputElement).value
          }} /></label
      ><label
        >Wait (ms)
        <input
          .value=${String(this.wait)}
          @input=${(event: Event) => {
            this.wait = Number((event.target as HTMLInputElement).value)
          }}
          type="number"
          min="0"
      /></label>
      <div>
        <button @click=${this.schedule}>Schedule</button
        ><button @click=${this.burst}>Schedule three</button
        ><button @click=${() => this.utility.flush()}>Flush</button
        ><button @click=${() => this.utility.cancel()}>Cancel</button
        ><button
          @click=${() => {
            this.history = []
          }}
        >
          Clear history
        </button>
      </div>
      <section>
        <h2>Processed results</h2>
        <pre data-testid="history">
${JSON.stringify(this.history, null, 2)}</pre>
      </section>
      <section>
        <h2>Utility state</h2>
        <pre>${JSON.stringify(this.utility.state, null, 2)}</pre>
      </section>
      <p class="caption">
        Host updates refresh options. Disconnecting the element cleans up its
        utility.
      </p>
    </main>`
  }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
