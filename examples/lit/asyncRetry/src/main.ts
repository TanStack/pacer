import { LitElement, html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { asyncRetry } from '@tanstack/lit-pacer'
interface UserData {
  id: number
  name: string
  email: string
}
class Demo extends LitElement {
  static properties = {
    userId: { state: true },
    userData: { state: true },
    isLoading: { state: true },
    displayedError: { state: true },
    currentAttempt: { state: true },
    scenario: { state: true },
    logs: { state: true },
  }
  fakeApi = async (
    userId: string,
    options: {
      shouldFail?: boolean
      shouldTimeout?: boolean
    } = {},
  ): Promise<UserData> => {
    const delay = options.shouldTimeout ? 3000 : 800 // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay))
    if (options.shouldFail || Math.random() < 0.6) {
      throw new Error(`Network error fetching user ${userId}`)
    }
    return {
      id: parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    }
  }
  userId = '123'
  userData: UserData | null = null
  isLoading = false
  displayedError: string | null = null
  currentAttempt = 0
  scenario: 'default' | 'timeout' | 'jitter' | 'linear' = 'default'
  logs: Array<string> = []
  addLog = (message: string) => {
    this.logs = [
      ...this.logs.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]
  }
  getOptions = () => {
    const baseOptions = {
      onRetry: (attempt: number, error: Error) => {
        this.addLog(`Retry attempt ${attempt} after error: ${error.message}`)
        this.currentAttempt = attempt + 1
      },
      onError: (error: Error) => {
        this.addLog(`Request failed: ${error.message}`)
      },
      onLastError: (error: Error) => {
        this.addLog(`All retries exhausted: ${error.message}`)
        this.displayedError = error.message
        this.userData = null
      },
      onSuccess: (result: UserData) => {
        this.addLog(`Request succeeded for user ${result.id}`)
        this.userData = result
        this.displayedError = null
      },
      onSettled: () => {
        this.addLog('Request settled')
        this.currentAttempt = 0
      },
    }
    switch (this.scenario) {
      case 'timeout':
        return {
          ...baseOptions,
          maxAttempts: 3,
          backoff: 'exponential' as const,
          baseWait: 500,
          maxExecutionTime: 2000, // Individual call timeout
          maxTotalExecutionTime: 8000, // Total timeout for all retries
          jitter: 0,
        }
      case 'jitter':
        return {
          ...baseOptions,
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 500,
          jitter: 0.3, // 30% random variation
        }
      case 'linear':
        return {
          ...baseOptions,
          maxAttempts: 4,
          backoff: 'linear' as const,
          baseWait: 1000,
          jitter: 0,
        }
      default:
        return {
          ...baseOptions,
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 1000,
          jitter: 0,
        }
    }
  }
  onFetchUser = // Handle fetch with retry - following docs pattern
    async () => {
      this.logs = []
      this.isLoading = true
      this.displayedError = null
      this.currentAttempt = 1
      this.addLog('Starting fetch operation')
      try {
        // Create retry-enabled function
        const fetchUserWithRetry = asyncRetry(async (id: string) => {
          this.addLog(`Attempting to fetch user ${id}`)
          return await this.fakeApi(id, {
            shouldTimeout: this.scenario === 'timeout',
          })
        }, this.getOptions())
        // Call the retry-enabled function
        const result = await fetchUserWithRetry(this.userId)
        this.addLog(
          `Final result: ${result ? `User ${result.id}` : 'undefined'}`,
        )
      } catch (error) {
        this.addLog(
          `Caught error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
        this.displayedError =
          error instanceof Error ? error.message : 'Unknown error'
      } finally {
        this.isLoading = false
      }
    }
  onReset = () => {
    this.userData = null
    this.displayedError = null
    this.logs = []
    this.currentAttempt = 0
    this.addLog('State reset')
  }
  override createRenderRoot() {
    return this
  }
  override render() {
    return html`<div
      style=${styleMap({ padding: '20px', maxWidth: '1200px', margin: '0 auto' })}
    >
      <h1>TanStack Pacer asyncRetry Example</h1>
      <p>
        Demonstrates the asyncRetry utility function with configurable backoff
        strategies, timeouts, jitter, and error handling.
      </p>
      <div
        style=${styleMap({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '20px',
        })}
      >
        <div>
          <h3>Configuration</h3>
          <div style=${styleMap({ marginBottom: '10px' })}>
            <label style=${styleMap({ display: 'block', marginBottom: '5px' })}
              >Scenario:</label
            ><select
              .value=${this.scenario}
              @input=${(e: Event) =>
                (this.scenario = (e.target as HTMLInputElement)
                  .value as typeof this.scenario)}
              style=${styleMap({ padding: '5px', width: '100%' })}
              ?disabled=${this.isLoading}
            >
              <option value="default">Default (Exponential Backoff)</option>
              <option value="timeout">With Timeouts</option>
              <option value="jitter">With Jitter (30%)</option>
              <option value="linear">Linear Backoff</option>
            </select>
          </div>
          <div style=${styleMap({ marginBottom: '10px' })}>
            <label style=${styleMap({ display: 'block', marginBottom: '5px' })}
              >User ID:</label
            ><input
              type="text"
              .value=${this.userId}
              @input=${(e: Event) => (this.userId = (e.target as HTMLInputElement).value)}
              placeholder="Enter user ID..."
              style=${styleMap({ padding: '5px', width: '100%' })}
              ?disabled=${this.isLoading}
            />
          </div>
          <div
            style=${styleMap({
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            })}
          >
            <button
              @click=${this.onFetchUser}
              ?disabled=${this.isLoading}
              style=${styleMap({ padding: '10px' })}
            >
              ${this.isLoading ? 'Fetching...' : 'Fetch User'}</button
            ><button
              @click=${this.onReset}
              style=${styleMap({ padding: '10px' })}
            >
              Reset
            </button>
          </div>
          <div
            style=${styleMap({
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
            })}
          >
            <h4>Current Options:</h4>
            <pre style=${styleMap({ fontSize: '12px', margin: 0 })}>
${(() => {
                const opts = this.getOptions()
                return JSON.stringify(
                  {
                    maxAttempts: opts.maxAttempts,
                    backoff: opts.backoff,
                    baseWait: opts.baseWait,
                    jitter: opts.jitter,
                    maxExecutionTime:
                      'maxExecutionTime' in opts
                        ? opts.maxExecutionTime
                        : Infinity,
                    maxTotalExecutionTime:
                      'maxTotalExecutionTime' in opts
                        ? opts.maxTotalExecutionTime
                        : Infinity,
                  },
                  null,
                  2,
                )
              })()}</pre>
          </div>
        </div>
        <div>
          <h3>State</h3>
          <div
            style=${styleMap({
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
            })}
          >
            <div style=${styleMap({ marginBottom: '10px' })}>
              <strong>Status:</strong>${' '}<span
                style=${styleMap({
                  padding: '2px 8px',
                  borderRadius: '3px',
                  backgroundColor: this.isLoading
                    ? this.currentAttempt > 1
                      ? '#ff8c00'
                      : '#ffd700'
                    : '#90ee90',
                })}
                >${
                  this.isLoading
                    ? this.currentAttempt > 1
                      ? 'retrying'
                      : 'executing'
                    : 'idle'
                }</span
              >
            </div>
            ${
              this.currentAttempt > 0
                ? html`<p>
                    <strong>Current Attempt:</strong> ${this.currentAttempt}
                    /${' '}${(() => {
                      const opts = this.getOptions()
                      return opts.maxAttempts
                    })()}
                  </p>`
                : nothing
            }${
              this.displayedError
                ? html`<div
                    style=${styleMap({
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#ffe6e6',
                      borderRadius: '5px',
                      color: '#d32f2f',
                    })}
                  >
                    <strong>Error:</strong><br />${this.displayedError}
                  </div>`
                : nothing
            }
          </div>
          ${
            this.userData
              ? html`<div
                  style=${styleMap({
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '5px',
                  })}
                >
                  <h4>User Data:</h4>
                  <p><strong>ID:</strong> ${this.userData.id}</p>
                  <p><strong>Name:</strong> ${this.userData.name}</p>
                  <p><strong>Email:</strong> ${this.userData.email}</p>
                </div>`
              : nothing
          }
        </div>
      </div>
      <div style=${styleMap({ marginTop: '20px' })}>
        <h3>Activity Log</h3>
        <div
          style=${styleMap({
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          })}
        >
          ${this.logs.length === 0 ? html`<div style=${styleMap({ color: '#999' })}>No activity yet</div>` : html`${this.logs.map((log, _i) => html`<div style=${styleMap({ marginBottom: '5px' })}>${log}</div>`)}`}
        </div>
      </div>
      <div
        style=${styleMap({
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
          fontSize: '14px',
        })}
      >
        <strong>Note:</strong> This example uses the
        <code>asyncRetry</code>${' '}utility function, which creates a
        retry-enabled version of your async function. Each call to the
        retry-enabled function creates a fresh retry context.
      </div>
      <div
        style=${styleMap({
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '12px',
        })}
      >
        <strong>Key Features:</strong>
        <ul style=${styleMap({ marginTop: '10px', marginBottom: 0 })}>
          <li>
            <strong>Exponential Backoff:</strong> Wait time doubles with each
            retry (1s, 2s, 4s, ...)
          </li>
          <li>
            <strong>Linear Backoff:</strong> Wait time increases linearly (1s,
            2s, 3s, ...)
          </li>
          <li>
            <strong>Jitter:</strong> Adds randomness to prevent thundering herd
            problems
          </li>
          <li>
            <strong>Timeouts:</strong> Control individual and total execution
            time
          </li>
        </ul>
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
