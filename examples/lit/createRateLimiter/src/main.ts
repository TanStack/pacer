import { LitElement, html } from 'lit'
import { createRateLimiter } from '@tanstack/lit-pacer'
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
  utility = createRateLimiter(
    this,
    (value: string) => {
      this.history = [...this.history, value]
    },
    () => ({ limit: 2, window: this.wait }),
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
      <h1>Lit createRateLimiter</h1>
      <p>
        Accept up to two executions per time window and track rejected calls.
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
        ><button @click=${() => this.utility.reset()}>Reset window</button
        ><button @click=${() => this.utility.reset()}>Reset</button
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
