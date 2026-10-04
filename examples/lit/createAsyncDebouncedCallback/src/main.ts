import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { createAsyncDebouncedCallback } from '@tanstack/lit-pacer/async-debouncer'
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
  debouncedSearch = createAsyncDebouncedCallback(
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
      wait: 500,
      // leading: true, // optional, defaults to false
      // trailing: true, // optional, defaults to true
    }),
  )
  handleSearchChange = async (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await this.debouncedSearch(newValue)
    } catch (err) {
      // Error is already handled in the debounced function
      console.log('Search failed:', err)
    }
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncDebouncedCallback Example 1</h1>
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
  debouncedIncrement = createAsyncDebouncedCallback(
    this,
    async (currentValue: number) => {
      const result = await this.incrementApi(currentValue)
      this.count = result
      return result
    },
    () => ({
      wait: 1000,
      leading: false, // Don't execute immediately
      trailing: true, // Execute after delay
    }),
  )
  handleIncrement = () => {
    // Update local state immediately for instant feedback
    const newCount = this.count + 1
    this.count = newCount
    // Debounced API call
    this.debouncedIncrement(newCount)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncDebouncedCallback Example 2</h1>
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
          Increment (debounced API call)
        </button>
      </div>
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Click rapidly - API calls are debounced to 1 second, but UI updates
        immediately
      </p>
    </div>`
  }
}
customElements.define('pacer-search', Search)
class Range extends LitElement {
  static properties = {
    email: { state: true },
    validationResult: { state: true },
    isValidating: { state: true },
  }
  email = ''
  validationResult: {
    isValid: boolean
    message: string
  } | null = null
  isValidating = false
  validateEmail = async (
    emailAddress: string,
  ): Promise<{
    isValid: boolean
    message: string
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)
    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }
  debouncedValidateEmail = createAsyncDebouncedCallback(
    this,
    async (emailAddress: string) => {
      if (!emailAddress.trim()) {
        this.validationResult = null
        return null
      }
      this.isValidating = true
      try {
        const result = await this.validateEmail(emailAddress)
        this.validationResult = result
        return result
      } finally {
        this.isValidating = false
      }
    },
    () => ({
      wait: 750,
      leading: false,
    }),
  )
  handleEmailChange = (e: Event) => {
    const newEmail = (e.target as HTMLInputElement).value
    this.email = newEmail
    this.debouncedValidateEmail(newEmail)
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div>
      <h1>TanStack Pacer createAsyncDebouncedCallback Example 3</h1>
      <div style=${styleMap({ marginBottom: '20px' })}>
        <label
          >Email Address:<input
            type="email"
            .value=${this.email}
            @input=${this.handleEmailChange}
            placeholder="Enter your email..."
            style=${styleMap({
              width: '100%',
              marginTop: '5px',
              padding: '8px',
              borderColor:
                this.validationResult?.isValid === false
                  ? 'red'
                  : this.validationResult?.isValid === true
                    ? 'green'
                    : 'initial',
            })}
        /></label>
      </div>
      ${this.isValidating ? html`<p style=${styleMap({ color: 'blue' })}>Validating email...</p>` : nothing}${
        this.validationResult
          ? html`<p
              style=${styleMap({
                color: this.validationResult.isValid ? 'green' : 'red',
                fontWeight: 'bold',
              })}
            >
              ${this.validationResult.message}
            </p>`
          : nothing
      }
      <p style=${styleMap({ fontSize: '0.9em', color: '#666' })}>
        Email validation is debounced to 750ms after you stop typing
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
