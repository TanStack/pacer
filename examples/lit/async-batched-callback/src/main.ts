import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncBatcher } from '@tanstack/lit-pacer/async-batcher'
interface SearchResult {
  id: number
  title: string
  query: string
}
interface EmailValidationRequest {
  email: string
  timestamp: Date
}
interface EmailValidationResult {
  email: string
  isValid: boolean
  message: string
}
interface DataPoint {
  id: string
  value: number
  category: string
}
class Counter extends LitElement {
  static properties = {
    searchQueries: { state: true },
    results: { state: true },
    isLoading: { state: true },
    displayedError: { state: true },
    batchesProcessed: { state: true },
  }
  batchedSearchApi = async (
    queries: Array<string>,
  ): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
    if (queries.some((q) => q === 'error')) {
      throw new Error('Simulated batch API error')
    }
    return queries.flatMap((query, index) => [
      { id: index * 10 + 1, title: `${query} result 1`, query },
      { id: index * 10 + 2, title: `${query} result 2`, query },
    ])
  }
  searchQueries: Array<string> = []
  results: Array<SearchResult> = []
  isLoading = false
  displayedError: string | null = null
  batchesProcessed = 0
  batchedSearch = createAsyncBatcher(
    this,
    async (queries: Array<string>) => {
      this.isLoading = true
      this.displayedError = null
      try {
        const data = await this.batchedSearchApi(queries)
        this.results = [...this.results, ...data]
        this.batchesProcessed = this.batchesProcessed + 1
        return data
      } finally {
        this.isLoading = false
      }
    },
    () => ({
      maxSize: 3, // Process when 3 queries collected
      wait: 2000, // Or after 2 seconds
      throwOnError: false,
      onError: (error) => {
        this.displayedError =
          error instanceof Error ? error.message : 'Unknown error'
      },
    }),
  ).addItem
  handleSearch = (query: string) => {
    if (!query.trim()) return
    this.searchQueries = [...this.searchQueries, query]
    this.batchedSearch(query)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncBatcher Example 1</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <button @click=${() => this.handleSearch('javascript')}>
          Search "javascript"</button
        ><button
          @click=${() => this.handleSearch('react')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Search "react"</button
        ><button
          @click=${() => this.handleSearch('typescript')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Search "typescript"</button
        ><button
          @click=${() => this.handleSearch('error')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Search "error" (will fail)
        </button>
      </div>
      ${this.isLoading ? html`<p style=${styleMap({ color: 'blue' })}>Processing batch search...</p>` : nothing}${this.displayedError ? html`<p style=${styleMap({ color: 'red' })}>Error: ${this.displayedError}</p>` : nothing}
      <table>
        <tbody>
          <tr>
            <td>Total Searches Made:</td>
            <td>${this.searchQueries.length}</td>
          </tr>
          <tr>
            <td>Results Found:</td>
            <td>${this.results.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>${this.batchesProcessed}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h3>Search Results:</h3>
        <div
          style=${styleMap({
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          })}
        >
          ${this.results.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No results yet...</p>` : html`${this.results.map((result, _index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}><strong>${result.query}</strong>: ${result.title}</div>`)}`}
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Searches are batched - max 3 queries or 2 second wait time
      </p>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = {
    emailRequests: { state: true },
    validationResults: { state: true },
    isValidating: { state: true },
    batchesProcessed: { state: true },
  }
  batchValidateEmails = async (
    requests: Array<EmailValidationRequest>,
  ): Promise<Array<EmailValidationResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return requests.map((request) => ({
      email: request.email,
      isValid: emailRegex.test(request.email),
      message: emailRegex.test(request.email)
        ? 'Email is valid!'
        : 'Invalid email format',
    }))
  }
  emailRequests: Array<EmailValidationRequest> = []
  validationResults: Array<EmailValidationResult> = []
  isValidating = false
  batchesProcessed = 0
  batchedValidateEmail = createAsyncBatcher(
    this,
    async (requests: Array<EmailValidationRequest>) => {
      this.isValidating = true
      try {
        const results = await this.batchValidateEmails(requests)
        this.validationResults = [...this.validationResults, ...results]
        this.batchesProcessed = this.batchesProcessed + 1
        return results
      } finally {
        this.isValidating = false
      }
    },
    () => ({
      maxSize: 4, // Process when 4 emails collected
      wait: 1500, // Or after 1.5 seconds
    }),
  ).addItem
  validateEmail = (email: string) => {
    if (!email.trim()) return
    const request: EmailValidationRequest = {
      email,
      timestamp: new Date(),
    }
    this.emailRequests = [...this.emailRequests, request]
    this.batchedValidateEmail(request)
  }
  sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncBatcher Example 2</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        ${this.sampleEmails.map((email, _index) => html`<button @click=${() => this.validateEmail(email)} style=${styleMap({ marginRight: '10px', marginBottom: '5px' })}>Validate "${email}"</button>`)}
      </div>
      ${this.isValidating ? html`<p style=${styleMap({ color: 'blue' })}>Validating email batch...</p>` : nothing}
      <table>
        <tbody>
          <tr>
            <td>Total Validations Requested:</td>
            <td>${this.emailRequests.length}</td>
          </tr>
          <tr>
            <td>Validations Completed:</td>
            <td>${this.validationResults.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>${this.batchesProcessed}</td>
          </tr>
        </tbody>
      </table>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h3>Validation Results:</h3>
        <div
          style=${styleMap({
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          })}
        >
          ${
            this.validationResults.length === 0
              ? html`<p style=${styleMap({ color: '#666' })}>
                  No validations completed yet...
                </p>`
              : html`${this.validationResults.map(
                  (result, _index) =>
                    html`<div
                      style=${styleMap({
                        marginBottom: '5px',
                        fontSize: '0.9em',
                        color: result.isValid ? 'green' : 'red',
                      })}
                    >
                      <strong>${result.email}</strong>: ${result.message}
                    </div>`,
                )}`
          }
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Email validations are batched - max 4 emails or 1.5 second wait time
      </p>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    dataQueue: { state: true },
    processedData: { state: true },
    summaries: { state: true },
    isProcessing: { state: true },
    batchesProcessed: { state: true },
  }
  batchProcessData = async (
    dataPoints: Array<DataPoint>,
  ): Promise<{
    processed: Array<DataPoint>
    summary: any
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Simulate processing
    const processed = dataPoints.map((point) => ({
      ...point,
      value: point.value * 2, // Double the values as "processing"
    }))
    const summary = {
      totalItems: processed.length,
      totalValue: processed.reduce((sum, point) => sum + point.value, 0),
      categories: [...new Set(processed.map((p) => p.category))].length,
    }
    return { processed, summary }
  }
  dataQueue: Array<DataPoint> = []
  processedData: Array<DataPoint> = []
  summaries: Array<any> = []
  isProcessing = false
  batchesProcessed = 0
  batchedDataProcessor = createAsyncBatcher(
    this,
    async (dataPoints: Array<DataPoint>) => {
      this.isProcessing = true
      try {
        const result = await this.batchProcessData(dataPoints)
        this.processedData = [...this.processedData, ...result.processed]
        this.summaries = [...this.summaries, result.summary]
        this.batchesProcessed = this.batchesProcessed + 1
        return result
      } finally {
        this.isProcessing = false
      }
    },
    () => ({
      maxSize: 5, // Process when 5 data points collected
      wait: 2500, // Or after 2.5 seconds
    }),
  ).addItem
  addDataPoint = (category: string) => {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    this.dataQueue = [...this.dataQueue, dataPoint]
    this.batchedDataProcessor(dataPoint)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncBatcher Example 3</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <button @click=${() => this.addDataPoint('sales')}>
          Add Sales Data</button
        ><button
          @click=${() => this.addDataPoint('marketing')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Add Marketing Data</button
        ><button
          @click=${() => this.addDataPoint('operations')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Add Operations Data</button
        ><button
          @click=${() => this.addDataPoint('finance')}
          style=${styleMap({ marginLeft: '10px' })}
        >
          Add Finance Data
        </button>
      </div>
      ${this.isProcessing ? html`<p style=${styleMap({ color: 'blue' })}>Processing data batch...</p>` : nothing}
      <table>
        <tbody>
          <tr>
            <td>Data Points Queued:</td>
            <td>${this.dataQueue.length}</td>
          </tr>
          <tr>
            <td>Data Points Processed:</td>
            <td>${this.processedData.length}</td>
          </tr>
          <tr>
            <td>Batches Completed:</td>
            <td>${this.batchesProcessed}</td>
          </tr>
        </tbody>
      </table>
      <div
        style=${styleMap({ marginTop: '20px', display: 'flex', gap: '20px' })}
      >
        <div style=${styleMap({ flex: 1 })}>
          <h3>Processed Data:</h3>
          <div
            style=${styleMap({
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            })}
          >
            ${this.processedData.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No data processed yet...</p>` : html`${this.processedData.map((point, _index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}><strong>${point.category}</strong>: ${point.value} (${point.id})</div>`)}`}
          </div>
        </div>
        <div style=${styleMap({ flex: 1 })}>
          <h3>Batch Summaries:</h3>
          <div
            style=${styleMap({
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            })}
          >
            ${this.summaries.length === 0 ? html`<p style=${styleMap({ color: '#666' })}>No summaries yet...</p>` : html`${this.summaries.map((summary, index) => html`<div style=${styleMap({ marginBottom: '5px', fontSize: '0.9em' })}><strong>Batch ${index + 1}</strong>: ${summary.totalItems}${' '}items, total value: ${summary.totalValue}, categories:${' '}${summary.categories}</div>`)}`}
          </div>
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Data processing is batched - max 5 items or 2.5 second wait time
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
