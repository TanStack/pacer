import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncThrottler } from '@tanstack/lit-pacer/async-throttler'
interface SearchResult {
  id: number
  title: string
}
class Counter extends LitElement {
  static properties = {
    searchTerm: { state: true },
    results: { state: true },
    isLoading: { state: true },
    error: { state: true },
  }
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    if (term === 'error') {
      throw new Error('Simulated API error')
    }
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  searchTerm = ''
  results: Array<SearchResult> = []
  isLoading = false
  error: string | null = null
  throttledSearch = createAsyncThrottler(
    this,
    async (term: string) => {
      if (!term.trim()) {
        this.results = []
        return []
      }
      this.isLoading = true
      this.error = null
      try {
        const data = await this.fakeApi(term)
        this.results = data
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        this.error = errorMessage
        this.results = []
        throw err
      } finally {
        this.isLoading = false
      }
    },
    () => ({
      wait: 1000,
      // leading: true, // optional, defaults to true
      // trailing: true, // optional, defaults to true
    }),
  ).maybeExecute
  handleSearchChange = async (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await this.throttledSearch(newValue)
    } catch (err) {
      // Error is already handled in the throttled function
      console.log('Search failed:', err)
    }
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncThrottler Example 1</h1>
      <div>
        <input
          type="search"
          .value=${this.searchTerm}
          @input=${this.handleSearchChange}
          placeholder="Type to search... (try 'error' to see error handling)"
          style=${styleMap({ width: '100%', marginBottom: '10px' })}
        />
      </div>
      ${this.isLoading ? html`<p style=${styleMap({ color: 'blue' })}>Searching...</p>` : nothing}${this.error ? html`<p style=${styleMap({ color: 'red' })}>Error: ${this.error}</p>` : nothing}
      <div>
        <p>Current search term: ${this.searchTerm}</p>
        ${
          this.results.length > 0
            ? html`<div>
                <h3>Results:</h3>
                <ul>
                  ${this.results.map((result, _index) => html`<li>${result.title}</li>`)}
                </ul>
              </div>`
            : nothing
        }
      </div>
    </div>`
  }
}
customElements.define('pacer-counter', Counter)
class Search extends LitElement {
  static properties = { count: { state: true }, apiCallCount: { state: true } }
  count = 0
  apiCallCount = 0
  incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    this.apiCallCount = this.apiCallCount + 1
    return newCount
  }
  throttledIncrement = createAsyncThrottler(
    this,
    async (currentValue: number) => {
      const result = await this.incrementApi(currentValue)
      this.count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: true, // Execute immediately on first call
      trailing: true, // Execute after throttle period ends
    }),
  ).maybeExecute
  handleIncrement = () => {
    // Update local state immediately for instant feedback
    this.count = ((prev) => {
      const newCount = prev + 1
      this.throttledIncrement(newCount)
      return newCount
    })(this.count)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncThrottler Example 2</h1>
      <table>
        <tbody>
          <tr>
            <td>Current Count:</td>
            <td>${this.count}</td>
          </tr>
          <tr>
            <td>API Calls Made:</td>
            <td>${this.apiCallCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click=${this.handleIncrement}>
          Increment (throttled API call)
        </button>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Click rapidly - API calls are throttled to 1 second, but UI updates
        immediately. First click executes immediately, then at most once per
        second.
      </p>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    scrollPosition: { state: true },
    saveCount: { state: true },
    lastSaved: { state: true },
    isSaving: { state: true },
  }
  scrollPosition = 0
  saveCount = 0
  lastSaved: Date | null = null
  isSaving = false
  saveScrollPosition = async (
    position: number,
  ): Promise<{
    success: boolean
    position: number
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }
  throttledSave = createAsyncThrottler(
    this,
    async (position: number) => {
      this.isSaving = true
      try {
        const result = await this.saveScrollPosition(position)
        this.saveCount = this.saveCount + 1
        this.lastSaved = new Date()
        return result
      } finally {
        this.isSaving = false
      }
    },
    () => ({
      wait: 1000,
      leading: true,
      trailing: true,
    }),
  ).maybeExecute
  handleScroll = (e: Event) => {
    const position = (e.currentTarget as HTMLDivElement).scrollTop
    this.scrollPosition = position
    this.throttledSave(position)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncThrottler Example 3</h1>
      <div
        style=${styleMap({
          height: '200px',
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px',
        })}
        role="region"
        aria-label="Scroll position demo"
        @scroll=${this.handleScroll}
      >
        <div style=${styleMap({ height: '1000px' })}>
          <p>Scroll this area to trigger throttled saves!</p>
          <p>Current scroll position: ${Math.round(this.scrollPosition)}px</p>
          ${this.isSaving ? html`<p style=${styleMap({ color: 'blue' })}>Saving position...</p>` : nothing}
          <div style=${styleMap({ marginTop: '20px' })}>
            <p>Saves triggered: ${this.saveCount}</p>
            ${this.lastSaved ? html`<p>Last saved at: ${this.lastSaved.toLocaleTimeString()}</p>` : nothing}
          </div>
          <div style=${styleMap({ marginTop: '40px' })}>
            <p>Keep scrolling...</p>
            <p style=${styleMap({ marginTop: '100px' })}>More content...</p>
            <p style=${styleMap({ marginTop: '100px' })}>
              Even more content...
            </p>
            <p style=${styleMap({ marginTop: '100px' })}>Almost there...</p>
            <p style=${styleMap({ marginTop: '100px' })}>
              You made it to the end!
            </p>
          </div>
        </div>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Scroll position is saved at most once per second, but updates instantly
        on screen
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
