import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createDebouncer } from '@tanstack/lit-pacer/debouncer'
import { createThrottler } from '@tanstack/lit-pacer/throttler'
import { createRateLimiter } from '@tanstack/lit-pacer/rate-limiter'
import { createQueuer } from '@tanstack/lit-pacer/queuer'
import { createBatcher } from '@tanstack/lit-pacer/batcher'
class Demo extends LitElement {
  static properties = {
    currentValue: { state: true },
    instantExecutionCount: { state: true },
    debouncedValue: { state: true },
    throttledValue: { state: true },
    rateLimitedValue: { state: true },
    queuedValue: { state: true },
    batchedValue: { state: true },
  }
  explainReadonly = () => {
    window.alert('These sliders are read-only. Move the main slider at the top')
  }
  currentValue = 50
  instantExecutionCount = 0
  debouncedValue = 50
  throttledValue = 50
  rateLimitedValue = 50
  queuedValue = 50
  batchedValue = 50
  debouncer = createDebouncer(
    this,
    (value: typeof this.debouncedValue) => {
      this.debouncedValue = value
    },
    () => ({
      key: 'my-debouncer',
      wait: 600,
    }),
    (state) => state,
  )
  throttler = createThrottler(
    this,
    (value: typeof this.throttledValue) => {
      this.throttledValue = value
    },
    () => ({
      key: 'my-throttler',
      wait: 600,
    }),
    (state) => state,
  )
  rateLimiter = createRateLimiter(
    this,
    (value: typeof this.rateLimitedValue) => {
      this.rateLimitedValue = value
    },
    () => ({
      key: 'my-rate-limiter',
      limit: 20,
      window: 2000,
      windowType: 'sliding',
    }),
    (state) => state,
  )
  queuer = createQueuer(
    this,
    (value: typeof this.queuedValue) => {
      this.queuedValue = value
    },
    () => ({
      key: 'my-queuer',
      wait: 100,
      maxSize: 50,
    }),
    (state) => state,
  )
  batcher = createBatcher(
    this,
    (items: Array<number>) => {
      // Use the last item in the batch as the displayed value
      if (items.length > 0) {
        this.batchedValue = items[items.length - 1]!
      }
    },
    () => ({
      key: 'my-batcher',
      wait: 600,
      maxSize: 5,
    }),
    (state) => state,
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // Trigger each utility
    this.debouncer.maybeExecute(newValue)
    this.throttler.maybeExecute(newValue)
    this.rateLimiter.maybeExecute(newValue)
    this.queuer.addItem(newValue)
    this.batcher.addItem(newValue)
  }
  getSyncStatus = (
    processedValue: number,
    utilityName: string,
    utilityState?: {
      status: string
    },
  ) => {
    const isOutOfSync = processedValue !== this.currentValue
    const isPending =
      (utilityName === 'Debouncer' && utilityState?.status === 'pending') ||
      (utilityName === 'Throttler' && utilityState?.status === 'pending') ||
      (utilityName === 'Queuer' && utilityState?.status === 'running') ||
      (utilityName === 'Batcher' && utilityState?.status === 'pending')
    // Tooltip explanations for why certain utilities become out of sync
    const getTooltip = () => {
      if (!isOutOfSync) return undefined
      switch (utilityName) {
        case 'Rate Limiter':
          return isPending
            ? 'Rate limiter is processing within limits'
            : 'Rate limiters reject executions when the limit is exceeded. Rejected calls are discarded entirely and never processed, causing the value to lag behind rapid changes.'
        case 'Queuer':
          return isPending
            ? 'Queuer is processing items from the queue'
            : 'Queuers reject new items when their buffer is full. If items are added faster than they can be processed, the buffer overflows and newer items are dropped.'
        default:
          return undefined
      }
    }
    return {
      isOutOfSync,
      isPending,
      statusText: isOutOfSync
        ? isPending
          ? 'Processing...'
          : 'Out of sync'
        : 'Synced',
      tooltip: getTooltip(),
    }
  }
  get utilityMetadata() {
    return [
      {
        name: 'Debouncer',
        value: this.debouncedValue,
        description: `Delays execution until after ${this.debouncer.options.wait}ms of inactivity`,
        color: '#3b82f6', // blue
        flush: () => this.debouncer.flush(),
        util: this.debouncer,
      },
      {
        name: 'Throttler',
        value: this.throttledValue,
        description: `Limits execution to once every ${this.throttler.options.wait}ms`,
        color: '#0891b2', // cyan
        flush: () => this.throttler.flush(),
        util: this.throttler,
      },
      {
        name: 'Rate Limiter',
        value: this.rateLimitedValue,
        description: `Allows max ${this.rateLimiter.options.limit} executions per ${this.rateLimiter.options.window}ms window`,
        color: '#ea580c', // orange
        util: this.rateLimiter,
      },
      {
        name: 'Queuer',
        value: this.queuedValue,
        description: `Processes items sequentially with ${this.queuer.options.wait}ms delay`,
        color: '#db2777', // pink
        flush: () => this.queuer.flush(),
        util: this.queuer,
      },
      {
        name: 'Batcher',
        value: this.batchedValue,
        description: `Processes in batches of ${this.batcher.options.maxSize} or after ${this.batcher.options.wait}ms`,
        color: '#8b5cf6', // purple
        flush: () => this.batcher.flush(),
        util: this.batcher,
      },
    ] as const
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div
      style=${styleMap({
        padding: '12px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '100%',
      })}
    >
      <h1 style=${styleMap({ fontSize: '1.5em', marginBottom: '15px' })}>
        TanStack Pacer Utilities Comparison
      </h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <h2 style=${styleMap({ fontSize: '1.2em', marginBottom: '10px' })}>
          Instant Slider (Move this slider to see the utilities in action)
        </h2>
        <div style=${styleMap({ marginBottom: '15px' })}>
          <label
            ><strong>Current Value: ${this.currentValue}</strong
            ><input
              max="100"
              min="0"
              @input=${this.handleRangeChange}
              style=${styleMap({ width: '100%', margin: '8px 0' })}
              type="range"
              .value=${this.currentValue}
          /></label>
        </div>
        <div style=${styleMap({ marginBottom: '15px' })}>
          <strong>Total Interactions:</strong
          >${' '}${this.instantExecutionCount}
        </div>
      </div>
      <div
        style=${styleMap({
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '30px',
        })}
      >
        ${this.utilityMetadata.map(
          (utility) =>
            html`<div
              style=${styleMap({
                border: `2px solid ${utility.color}`,
                borderRadius: '6px',
                padding: '10px',
                backgroundColor: this.getSyncStatus(
                  utility.value,
                  utility.name,
                  utility.util.state,
                ).isPending
                  ? 'rgba(254, 249, 195, 0.4)' // yellowish if pending
                  : this.getSyncStatus(
                        utility.value,
                        utility.name,
                        utility.util.state,
                      ).isOutOfSync
                    ? 'rgba(254, 226, 226, 0.4)' // reddish if out of sync
                    : 'rgba(209, 250, 229, 0.4)', // greenish if synced
                transition: 'background-color 0.2s ease',
              })}
            >
              <h3
                style=${styleMap({
                  color: utility.color,
                  margin: '0 0 8px 0',
                  fontSize: '1.1em',
                })}
              >
                ${utility.name}
              </h3>
              <p
                style=${styleMap({
                  fontSize: '0.85em',
                  color: '#666',
                  margin: '0 0 12px 0',
                  lineHeight: '1.4',
                })}
              >
                ${utility.description}
              </p>
              <div style=${styleMap({ marginBottom: '12px' })}>
                <div style=${styleMap({ marginBottom: '4px' })}>
                  <strong style=${styleMap({ fontSize: '0.9em' })}
                    >Value: ${utility.value}</strong
                  >
                </div>
                <div style=${styleMap({ marginBottom: '6px' })}>
                  ${
                    this.getSyncStatus(
                      utility.value,
                      utility.name,
                      utility.util.state,
                    ).isOutOfSync
                      ? html`<span
                          style=${styleMap({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: this.getSyncStatus(
                              utility.value,
                              utility.name,
                              utility.util.state,
                            ).isPending
                              ? '#f59e0b'
                              : '#ef4444',
                            fontSize: '0.8em',
                            cursor: this.getSyncStatus(
                              utility.value,
                              utility.name,
                              utility.util.state,
                            ).tooltip
                              ? 'help'
                              : 'default',
                          })}
                          title=${
                            this.getSyncStatus(
                              utility.value,
                              utility.name,
                              utility.util.state,
                            ).tooltip
                          }
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            style="display: inline-block; vertical-align: middle"
                          >
                            <path
                              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                            />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          ${
                            this.getSyncStatus(
                              utility.value,
                              utility.name,
                              utility.util.state,
                            ).statusText
                          }</span
                        >`
                      : html`<span
                          style=${styleMap({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#10b981',
                            fontSize: '0.8em',
                          })}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            style="display: inline-block; vertical-align: middle"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                          </svg>
                          ${
                            this.getSyncStatus(
                              utility.value,
                              utility.name,
                              utility.util.state,
                            ).statusText
                          }</span
                        >`
                  }
                </div>
                <input
                  @click=${this.explainReadonly}
                  type="range"
                  min="0"
                  max="100"
                  .value=${utility.value}
                  disabled
                  style=${styleMap({
                    width: '100%',
                    margin: '2px 0',
                    accentColor: utility.color,
                  })}
                />
              </div>
              <div
                style=${styleMap({
                  fontSize: '0.8em',
                  marginBottom: '12px',
                  lineHeight: '1.3',
                })}
              >
                <div>
                  <strong>Executions:</strong
                  >${' '}${utility.util.state.executionCount}
                </div>
                <div>
                  <strong>Reduction:</strong>${' '}${
                    this.instantExecutionCount === 0
                      ? html`${'0'}`
                      : html`${Math.round(
                          ((this.instantExecutionCount -
                            utility.util.state.executionCount) /
                            this.instantExecutionCount) *
                            100,
                        )}`
                  }%
                </div>
                ${utility.name === 'Rate Limiter' ? html`<div><strong>Rejections:</strong>${' '}${utility.util.state.rejectionCount}</div>` : nothing}${utility.name === 'Queuer' ? html`<div><strong>Queue Size:</strong>${' '}${utility.util.state.size}</div>` : nothing}${
                  utility.name === 'Batcher'
                    ? html`<div>
                          <strong>Batch Size:</strong
                          >${' '}${utility.util.state.size}
                        </div>
                        <div>
                          <strong>Items Processed:</strong
                          >${' '}${utility.util.state.totalItemsProcessed}
                        </div>`
                    : nothing
                }
                <div>
                  <strong>Status:</strong>${' '}${utility.util.state.status}
                </div>
              </div>
              ${
                'flush' in utility && typeof utility.flush === 'function'
                  ? html`<button
                      @click=${utility.flush}
                      style=${styleMap({
                        backgroundColor: utility.color,
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85em',
                        width: '100%',
                      })}
                    >
                      Flush
                    </button>`
                  : nothing
              }
            </div>`,
        )}
      </div>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h2 style=${styleMap({ fontSize: '1.2em', marginBottom: '10px' })}>
          Detailed States
        </h2>
        <div
          style=${styleMap({
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '8px',
          })}
        >
          ${this.utilityMetadata.map(
            (utility) =>
              html`<div>
                <h4
                  style=${styleMap({
                    color: utility.color,
                    margin: '0 0 5px 0',
                    fontSize: '0.9em',
                  })}
                >
                  ${utility.name} State
                </h4>
                <pre
                  style=${styleMap({
                    fontSize: '0.7em',
                    backgroundColor: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '500px',
                    margin: 0,
                  })}
                >
${JSON.stringify(utility.util.state, null, 2)}</pre>
              </div>`,
          )}
        </div>
      </div>
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
