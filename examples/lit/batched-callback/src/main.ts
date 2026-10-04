import { LitElement, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createBatcher } from '@tanstack/lit-pacer/batcher'
interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
interface ApiRequest {
  id: string
  data: any
}
class Counter extends LitElement {
  static properties = { logs: { state: true }, logCount: { state: true } }
  logs: LogEntry[] = []
  logCount = 0
  batchedLogger = createBatcher(
    this,
    (entries: LogEntry[]) => {
      console.log('Processing batch of logs:', entries)
      this.logs = [...this.logs, ...entries]
    },
    () => ({
      maxSize: 3, // Process when 3 logs collected
      wait: 2000, // Or after 2 seconds
    }),
  ).addItem
  addLog = (message: string) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
    }
    this.logCount = this.logCount + 1
    this.batchedLogger(newLog)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createBatcher Example 1</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <button @click=${() => this.addLog(`Log entry ${this.logCount + 1}`)}>
          Add Log Entry</button
        ><button
          @click=${() => this.addLog(`Warning ${this.logCount + 1}`)}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Add Warning</button
        ><button
          @click=${() => this.addLog(`Error ${this.logCount + 1}`)}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Add Error
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Logs Created:</td>
            <td>${this.logCount}</td>
          </tr>
          <tr>
            <td>Logs Processed:</td>
            <td>${this.logs.length}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h3>Processed Logs:</h3>
        <div
          style=${styleMap({
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          })}
        >
          ${this.logs.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No logs processed yet...</p>` : html`${this.logs.map((log, _index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}><strong>${log.timestamp.toLocaleTimeString()}</strong>:${' '}${log.message}</div>`)}`}
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Logs are batched - max 3 items or 2 second wait time
      </p>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    eventHistory: { state: true },
    totalEvents: { state: true },
    batchesProcessed: { state: true },
  }
  eventHistory: AnalyticsEvent[] = []
  totalEvents = 0
  batchesProcessed = 0
  trackEvents = createBatcher(
    this,
    (events: AnalyticsEvent[]) => {
      console.log('Sending analytics batch:', events)
      this.eventHistory = [...this.eventHistory, ...events]
      this.batchesProcessed = this.batchesProcessed + 1
    },
    () => ({
      maxSize: 5, // Send when 5 events collected
      wait: 3000, // Or after 3 seconds
    }),
  ).addItem
  trackEvent = (type: string, target: string) => {
    const event: AnalyticsEvent = {
      type,
      target,
      timestamp: new Date(),
    }
    this.totalEvents = this.totalEvents + 1
    this.trackEvents(event)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createBatcher Example 2</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <button @click=${() => this.trackEvent('click', 'button-1')}>
          Track Button Click</button
        ><button
          @click=${() => this.trackEvent('hover', 'card')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Track Hover Event</button
        ><button
          @click=${() => this.trackEvent('view', 'page')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Track Page View</button
        ><button
          @click=${() => this.trackEvent('form', 'submit')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Track Form Submit
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Events Created:</td>
            <td>${this.totalEvents}</td>
          </tr>
          <tr>
            <td>Events Sent:</td>
            <td>${this.eventHistory.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>${this.batchesProcessed}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h3>Sent Analytics Events:</h3>
        <div
          style=${styleMap({
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          })}
        >
          ${this.eventHistory.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No events sent yet...</p>` : html`${this.eventHistory.map((event, _index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}><strong>${event.timestamp.toLocaleTimeString()}</strong>:${' '}${event.type} - ${event.target}</div>`)}`}
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Analytics events are batched - max 5 events or 3 second wait time
      </p>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    requestHistory: { state: true },
    totalRequests: { state: true },
    processedRequests: { state: true },
  }
  requestHistory: ApiRequest[] = []
  totalRequests = 0
  processedRequests: ApiRequest[] = []
  batchApiRequests = createBatcher(
    this,
    (requests: ApiRequest[]) => {
      console.log('Processing batch of API requests:', requests)
      // Simulate API processing
      this.processedRequests = [...this.processedRequests, ...requests]
    },
    () => ({
      maxSize: 4, // Process when 4 requests collected
      wait: 1500, // Or after 1.5 seconds
    }),
  ).addItem
  makeApiRequest = (data: any) => {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    this.totalRequests = this.totalRequests + 1
    this.requestHistory = [...this.requestHistory, request]
    this.batchApiRequests(request)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createBatcher Example 3</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <button
          @click=${() => this.makeApiRequest({ action: 'save', item: 'document' })}
        >
          Save Document</button
        ><button
          @click=${() => this.makeApiRequest({ action: 'update', item: 'profile' })}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Update Profile</button
        ><button
          @click=${() => this.makeApiRequest({ action: 'delete', item: 'file' })}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Delete File</button
        ><button
          @click=${() => this.makeApiRequest({ action: 'create', item: 'folder' })}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Create Folder
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Requests Made:</td>
            <td>${this.totalRequests}</td>
          </tr>
          <tr>
            <td>Requests Queued:</td>
            <td>
              ${this.requestHistory.length - this.processedRequests.length}
            </td>
          </tr>
          <tr>
            <td>Requests Processed:</td>
            <td>${this.processedRequests.length}</td>
          </tr>
        </tbody>
      </table>
      <div
        style=${styleMap({ marginTop: '20px', display: 'flex', gap: '20px' })}
      >
        <div style=${styleMap({ flex: 1 })}>
          <h3>Queued Requests:</h3>
          <div
            style=${styleMap({
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            })}
          >
            ${
              this.requestHistory.filter(
                (req) => !this.processedRequests.some((p) => p.id === req.id),
              ).length === 0
                ? html`<p style=${styleMap({ color: '#666' })}>
                    No requests queued...
                  </p>`
                : html`${this.requestHistory
                    .filter(
                      (req) =>
                        !this.processedRequests.some((p) => p.id === req.id),
                    )
                    .map(
                      (request, _index) =>
                        html`<div
                          style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}
                        >
                          ${request.id}: ${JSON.stringify(request.data)}
                        </div>`,
                    )}`
            }
          </div>
        </div>
        <div style=${styleMap({ flex: 1 })}>
          <h3>Processed Requests:</h3>
          <div
            style=${styleMap({
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            })}
          >
            ${this.processedRequests.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No requests processed yet...</p>` : html`${this.processedRequests.map((request, _index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}>${request.id}: ${JSON.stringify(request.data)}</div>`)}`}
          </div>
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        API requests are batched - max 4 requests or 1.5 second wait time
      </p>
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
