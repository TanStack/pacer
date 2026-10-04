import { LitElement, html } from 'lit'
import { createDebouncer } from '@tanstack/lit-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter extends LitElement {
  static properties = {
    instantCount: { state: true },
    debouncedCount: { state: true },
  }
  instantCount = 0
  debouncedCount = 0
  debouncer = createDebouncer(
    this,
    (value: number) => {
      this.debouncedCount = value
    },
    {
      key: 'counter',
      wait: 800,
      enabled: () => this.instantCount > 2,
    },
    (state) => state,
  )
  increment = () => {
    this.instantCount++
    this.debouncer.maybeExecute(this.instantCount)
  }

  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncer Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Status:</td>
            <td>${this.debouncer.state.status}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>${this.debouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td colspan=${2}><hr /></td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>${this.instantCount}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>${this.debouncedCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click=${this.increment}>Increment</button
        ><button
          @click=${() => this.debouncer.flush()}
          style="margin-left: 10px"
        >
          Flush
        </button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.debouncer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)

class Search extends LitElement {
  static properties = {
    searchText: { state: true },
    debouncedSearchText: { state: true },
  }
  searchText = ''
  debouncedSearchText = ''
  setSearchDebouncer = createDebouncer(
    this,
    (value: string) => {
      this.debouncedSearchText = value
    },
    {
      key: 'search',
      wait: 500,
      enabled: () => this.searchText.length > 2,
    },
    (state) => state,
  )
  handleSearchChange = (event: Event) => {
    this.searchText = (event.target as HTMLInputElement).value
    this.setSearchDebouncer.maybeExecute(this.searchText)
  }

  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncer Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          .value=${this.searchText}
          @input=${this.handleSearchChange}
          placeholder="Type to search..."
          style="width: 100%; margin-bottom: 1rem"
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Is Pending:</td>
            <td>${this.setSearchDebouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>${this.setSearchDebouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td colspan=${2}><hr /></td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>${this.searchText}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>${this.debouncedSearchText}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click=${() => this.setSearchDebouncer.flush()}>Flush</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setSearchDebouncer.state, null, 2)}</pre>
    </div>`
  }
}
customElements.define('pacer-search', Search)

class Range extends LitElement {
  static properties = {
    currentValue: { state: true },
    debouncedValue: { state: true },
    instantExecutionCount: { state: true },
    wait: { state: true },
    enabled: { state: true },
  }
  currentValue = 50
  debouncedValue = 50
  instantExecutionCount = 0
  wait = 250
  enabled = true
  setValueDebouncer = createDebouncer(
    this,
    (value: number) => {
      this.debouncedValue = value
    },
    () => ({ key: 'range', wait: this.wait, enabled: this.enabled }),
    (state) => state,
  )
  handleRangeChange = (event: Event) => {
    this.currentValue = Number((event.target as HTMLInputElement).value)
    this.instantExecutionCount++
    this.setValueDebouncer.maybeExecute(this.currentValue)
  }

  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createDebouncer Example 3</h1>
      <fieldset>
        <legend>Reactive options</legend>
        <label
          >Delay: ${this.wait} ms<input
            type="range"
            min="0"
            max="1500"
            step="50"
            .value=${this.wait}
            @input=${(event: Event) => {
              this.wait = (
                event.currentTarget as HTMLInputElement
              ).valueAsNumber
            }} /></label
        ><label
          ><input
            type="checkbox"
            .checked=${this.enabled}
            @input=${(event: Event) => {
              this.enabled = (event.currentTarget as HTMLInputElement).checked
            }}
          />Enabled</label
        >
        <p>
          Changing the delay affects the next scheduled call. Disabling cancels
          pending work.
        </p>
      </fieldset>
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
          >Debounced Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            .value=${this.debouncedValue}
            disabled
            style="width: 100%"
          /><span>${this.debouncedValue}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Is Pending:</td>
            <td>${this.setValueDebouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>${this.instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>${this.setValueDebouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              ${this.instantExecutionCount - this.setValueDebouncer.state.executionCount}
            </td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              ${
                this.instantExecutionCount === 0
                  ? '0'
                  : Math.round(
                      ((this.instantExecutionCount -
                        this.setValueDebouncer.state.executionCount) /
                        this.instantExecutionCount) *
                        100,
                    )
              }%
            </td>
          </tr>
        </tbody>
      </table>
      <div style="color: #666; font-size: 0.9em">
        <p>Debounced to ${this.wait}ms wait time</p>
      </div>
      <div>
        <button @click=${() => this.setValueDebouncer.flush()}>Flush</button>
      </div>
      <pre style="margin-top: 20px">
${JSON.stringify(this.setValueDebouncer.state, null, 2)}</pre>
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
